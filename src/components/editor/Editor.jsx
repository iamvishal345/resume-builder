import { useState, useEffect, useRef, useMemo } from "react";
import {
  Layout,
  LayoutContent,
  VStack,
  HStack,
} from "@astryxdesign/core/Layout";
import { Grid } from "@astryxdesign/core/Grid";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Divider } from "@astryxdesign/core/Divider";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@astryxdesign/core/SegmentedControl";
import {
  Moon,
  Sun,
  LayoutTemplate,
  Download,
  Check,
  ClipboardCheck,
  Target,
  Sparkles,
  Palette,
  Undo2,
  Redo2,
  FileDown,
  Upload,
  LayoutDashboard,
} from "lucide-react";
import ErrorBoundary from "@routes/ErrorBoundary";
import AuthBar from "../auth/AuthBar";
import AiSettingsDialog from "../ai/AiSettingsDialog";
import ResumePreview from "../preview/ResumePreview";
import FullPagePreview from "../preview/FullPagePreview";
import TemplateGallery from "../preview/TemplateGallery";
import TemplateCustomize from "../preview/TemplateCustomize";
import ImportResumeDialog from "./ImportResumeDialog";
import CoverLetterEditor from "./CoverLetterEditor";
import JobMatchDrawer from "./JobMatchDrawer";
import AtScorePanel from "./AtScorePanel";
import CoherencePanel from "./CoherencePanel";
import SideDrawer from "./SideDrawer";
import { computeResumeScore } from "@features/ats/score";
import { buildResumeDocx, downloadDocx } from "@features/export/docx";
import { getPalette } from "@features/resume/palettes";
import {
  useStore,
  clearSavedAt,
  resumeDataOf,
  defaultResumeData,
} from "@store";
import { getResume, putResume, newResume } from "@features/resumes/db";
import { downloadResumePdf } from "@features/export/pdf";
import PersonalDetails from "./steps/PersonalDetails";
import WorkHistory from "./steps/WorkHistory";
import Education from "./steps/Education";
import Skills from "./steps/Skills";
import Summary from "./steps/Summary";
import AdditionalSections from "./steps/AdditionalSections";

const STEPS = [
  { id: "personal-details", label: "Details" },
  { id: "summary", label: "Summary" },
  { id: "work-history", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "additional-sections", label: "Extras" },
];

const STEP_COMPONENTS = {
  "personal-details": PersonalDetails,
  summary: Summary,
  "work-history": WorkHistory,
  education: Education,
  skills: Skills,
  "additional-sections": AdditionalSections,
};

const SECTION_STEP_FOR_ID = {
  header: "personal-details",
  summary: "summary",
  experience: "work-history",
  education: "education",
  skills: "skills",
};

const Stepper = ({ stepIndex, onJump }) => (
  <HStack
    gap={1}
    justify="start"
    width="100%"
    className="editor-stepper"
    role="tablist"
    aria-label="Resume sections"
  >
    {STEPS.map((step, index) => {
      const done = index < stepIndex;
      const active = index === stepIndex;
      return (
        <Button
          key={step.id}
          variant={active ? "primary" : done ? "secondary" : "ghost"}
          size="sm"
          label={step.label}
          icon={done ? <Check size={13} /> : null}
          onClick={() => onJump(index)}
        />
      );
    })}
  </HStack>
);

const useAutosaveLabel = () => {
  const [label, setLabel] = useState("Saved in this browser");
  const timer = useRef(null);
  useEffect(() => {
    const unsubscribe = useStore.subscribe(() => {
      setLabel("Saving…");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setLabel("Saved in this browser"), 700);
    });
    return () => {
      if (timer.current) clearTimeout(timer.current);
      unsubscribe();
    };
  }, []);
  return label;
};

const EditorPage = () => {
  const [stepIndex, setStepIndex] = useState(() => {
    if (typeof window === "undefined") return 0;
    const requested = new URLSearchParams(window.location.search).get("step");
    const index = STEPS.findIndex((s) => s.id === requested);
    return index >= 0 ? index : 0;
  });
  const [mode, setMode] = useState(() => {
    if (typeof window === "undefined") return "editor";
    const view = new URLSearchParams(window.location.search).get("view");
    return view === "letter" || view === "preview" ? view : "editor";
  });
  const [resumeCheckOpen, setResumeCheckOpen] = useState(false);
  const [jobMatchOpen, setJobMatchOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [resumeId, setResumeId] = useState(null);
  const createdAtRef = useRef(null);
  const docName = useRef("Untitled resume");
  const renameLocked = useRef(false);
  const baselineName = useRef("");
  const applyResumeData = useStore((state) => state.applyResumeData);

  // The document title the user sees and can edit. Once the user has
  // explicitly renamed the resume we stop auto-deriving the title from the
  // person's name during autosave and keep whatever they typed.
  const [docTitle, setDocTitle] = useState("Untitled resume");
  const updateDocTitle = (next) => {
    const value = (next || "").trim();
    docName.current = value || "Untitled resume";
    renameLocked.current = true;
    setDocTitle(docName.current);
  };

  // Load/create the resume this URL points at (IndexedDB in newer builds;
  // a legacy bare /editor URL falls back to the persisted local draft).
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const id = params.get("resume");
    const apply = useStore.getState().applyResumeData;
    let cancelled = false;
    (async () => {
      if (id) {
        try {
          const doc = await getResume(id);
          if (!doc) {
            window.location.replace("/resumes");
            return;
          }
          if (cancelled) return;
          if (apply) apply(doc.data);
          createdAtRef.current = doc.createdAt || Date.now();
          docName.current = doc.name || "Untitled resume";
          const pd = doc.data?.personalDetails || {};
          baselineName.current = [pd.firstName, pd.lastName]
            .filter(Boolean)
            .join(" ");
          setResumeId(doc.id);
          clearSavedAt();
        } catch {
          window.location.replace("/resumes");
        }
        return;
      }
      // Bare /editor visit: mint a fresh document so nothing gets lost.
      const doc = newResume("Untitled resume", defaultResumeData());
      const nextUrl = `/editor?resume=${doc.id}`;
      window.history.replaceState(null, "", nextUrl);
      await putResume(doc);
      if (cancelled) return;
      createdAtRef.current = doc.createdAt;
      setResumeId(doc.id);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Autosave the open resume to IndexedDB whenever content changes.
  const autosaveTimer = useRef(null);
  useEffect(() => {
    if (!resumeId) return undefined;
    const onStateChange = (state) => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(() => {
        const data = resumeDataOf(useStore.getState());
        const pd = data.personalDetails || {};
        const personName =
          [pd.firstName, pd.lastName].filter(Boolean).join(" ") || "";
        const renamed =
          Boolean(personName) &&
          Boolean(baselineName.current) &&
          personName !== baselineName.current;
        putResume({
          id: resumeId,
          name: renamed ? personName : docName.current,
          createdAt: createdAtRef.current || Date.now(),
          updatedAt: Date.now(),
          data,
        }).catch(() => {});
      }, 600);
    };
    const unsubscribe = useStore.subscribe(onStateChange);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      unsubscribe();
    };
  }, [resumeId]);

  const goNext = () =>
    setStepIndex((current) => Math.min(current + 1, STEPS.length - 1));
  const goPrev = () => setStepIndex((current) => Math.max(current - 1, 0));
  const goToStep = (index) =>
    setStepIndex(Math.max(0, Math.min(index, STEPS.length - 1)));
  const handleCanvasEdit = (sectionId) => {
    const isExtra = String(sectionId).startsWith("extra:");
    const stepId = isExtra
      ? "additional-sections"
      : SECTION_STEP_FOR_ID[sectionId] || "personal-details";
    const index = STEPS.findIndex((step) => step.id === stepId);
    if (index < 0) return;
    setMode("editor");
    goToStep(index);
  };
  const autosaveLabel = useAutosaveLabel();

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [stepIndex]);

  useEffect(() => {
    if (mode !== "editor") return undefined;
    const onKey = (event) => {
      const target = event.target;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
        return;
      }
      if (mod && event.key.toLowerCase() === "y") {
        event.preventDefault();
        redo();
        return;
      }
      if (event.key === "ArrowRight" || event.key === "PageDown") goNext();
      if (event.key === "ArrowLeft" || event.key === "PageUp") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const ActiveStep = STEP_COMPONENTS[STEPS[stepIndex].id];

  const [theme, setTheme] = useState(() =>
    typeof document !== "undefined" &&
    document.documentElement.dataset.theme === "dark"
      ? "dark"
      : "light",
  );

  const resumeSettings = useStore((state) => state.resumeSettings);
  const setResumeSettings = useStore((state) => state.setResumeSettings);
  const undo = useStore((state) => state.undo);
  const redo = useStore((state) => state.redo);
  const { canUndo, canRedo } = useStore((state) => state.history);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [aiSettingsOpen, setAiSettingsOpen] = useState(false);

  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const resumeSummary = useStore((state) => state.resumeSummary);
  const workHistory = useStore((state) => state.workHistory);
  const education = useStore((state) => state.education);
  const skills = useStore((state) => state.skills);
  const additionalSections = useStore((state) => state.additionalSections);

  const ats = useMemo(
    () =>
      computeResumeScore({
        pd: personalDetails,
        experience: workHistory,
        education,
        skills,
        summary: resumeSummary,
      }),
    [personalDetails, workHistory, education, skills, resumeSummary],
  );

  const toggleTheme = () => {
    const next =
      typeof window !== "undefined" &&
      typeof window.__toggleTheme === "function"
        ? window.__toggleTheme()
        : theme === "dark"
          ? "light"
          : "dark";
    setTheme(next);
  };

  const handleDownloadPdf = async () => {
    try {
      await downloadResumePdf({
        data: {
          pd: personalDetails,
          socialLinks,
          summary: resumeSummary,
          experience: workHistory,
          education,
          skills,
          extras: additionalSections,
        },
        templateId: resumeSettings.templateId,
        paletteId: resumeSettings.paletteId,
        fontId: resumeSettings.fontId,
        settings: resumeSettings,
      });
    } catch (error) {
      console.error("PDF export failed", error);
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const palette = getPalette(resumeSettings.paletteId);
      const fontId = resumeSettings.fontId ?? "sans";
      const blob = await buildResumeDocx(
        {
          pd: personalDetails,
          socialLinks,
          summary: resumeSummary,
          experience: workHistory,
          education,
          skills,
          extras: additionalSections,
        },
        { palette, fontId, settings: resumeSettings },
      );
      const name =
        [personalDetails.firstName, personalDetails.lastName]
          .filter(Boolean)
          .join(" ") || "resume";
      await downloadDocx(blob, name);
    } catch (error) {
      console.error("DOCX export failed", error);
    }
  };

  return (
    <ErrorBoundary>
      <Layout
        height="auto"
        padding={3}
        contentWidth={1320}
        header={
          <VStack gap={2} width="100%" className="editor-topbar">
            <HStack justify="between" align="center" gap={3} width="100%" wrap>
              <SegmentedControl
                value={mode}
                onChange={setMode}
                label="Editor view"
                size="sm"
              >
                <SegmentedControlItem value="editor" label="Edit" />
                <SegmentedControlItem value="preview" label="Preview" />
                <SegmentedControlItem value="letter" label="Letter" />
              </SegmentedControl>
              <HStack gap={2} align="center" wrap>
                <IconButton
                  label="AI preferences"
                  tooltip="AI preferences"
                  variant="ghost"
                  icon={<Sparkles size={16} />}
                  onClick={() => setAiSettingsOpen(true)}
                />
                <IconButton
                  label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                  variant="ghost"
                  icon={
                    theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
                  }
                  onClick={toggleTheme}
                />
                <AuthBar />
              </HStack>
            </HStack>
            <HStack
              justify="between"
              align="center"
              gap={3}
              width="100%"
              wrap
              className="editor-actions"
            >
              <HStack gap={2} align="center" wrap>
                <Text
                  type="inherit"
                  size="sm"
                  weight="medium"
                  color={
                    autosaveLabel === "Saved in this browser"
                      ? "secondary"
                      : "accent"
                  }
                >
                  {autosaveLabel}
                </Text>
                <Divider
                  orientation="vertical"
                  style={{ height: "var(--spacing-5)" }}
                />
                <HStack gap={0} align="center">
                  <IconButton
                    label="Undo (Ctrl+Z)"
                    tooltip="Undo (Ctrl+Z)"
                    variant="ghost"
                    icon={<Undo2 size={16} />}
                    disabled={!canUndo}
                    onClick={undo}
                  />
                  <IconButton
                    label="Redo (Ctrl+Shift+Z)"
                    tooltip="Redo (Ctrl+Shift+Z)"
                    variant="ghost"
                    icon={<Redo2 size={16} />}
                    disabled={!canRedo}
                    onClick={redo}
                  />
                  <Divider
                    orientation="vertical"
                    style={{ height: "var(--spacing-5)" }}
                  />
                  <IconButton
                    label="My resumes"
                    tooltip="All my resumes"
                    variant="ghost"
                    icon={<LayoutDashboard size={16} />}
                    onClick={() => {
                      window.location.href = "/resumes";
                    }}
                  />
                </HStack>
              </HStack>
              <HStack gap={2} align="center" wrap>
                <HStack gap={1} align="center">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Upload size={14} />}
                    label="Import"
                    onClick={() => setImportOpen(true)}
                  />
                </HStack>
                <Divider
                  orientation="vertical"
                  style={{ height: "var(--spacing-5)" }}
                />
                <HStack gap={1} align="center">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<ClipboardCheck size={14} />}
                    label={`Resume check · ${ats.score}/100`}
                    onClick={() => setResumeCheckOpen(true)}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Target size={14} />}
                    label="Job match"
                    onClick={() => setJobMatchOpen(true)}
                  />
                </HStack>
                <Divider
                  orientation="vertical"
                  style={{ height: "var(--spacing-5)" }}
                />
                <HStack gap={1} align="center">
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<FileDown size={14} />}
                    label="DOCX"
                    onClick={handleDownloadDocx}
                  />
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Download size={14} />}
                    label="Download PDF"
                    onClick={handleDownloadPdf}
                  />
                </HStack>
              </HStack>
            </HStack>
          </VStack>
        }
        content={
          <LayoutContent isScrollable={false} padding={4}>
            {mode === "letter" ? (
              <CoverLetterEditor onBack={() => setMode("editor")} />
            ) : mode === "editor" ? (
              <VStack gap={3} width="100%">
                <HStack justify="between" align="center" width="100%">
                  <Stepper stepIndex={stepIndex} onJump={goToStep} />
                  <HStack gap={2}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Palette size={15} />}
                      label="Customize"
                      onClick={() => setCustomizeOpen(true)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<LayoutTemplate size={14} />}
                      label="Templates"
                      onClick={() => setTemplateGalleryOpen(true)}
                    />
                  </HStack>
                </HStack>
                <Grid columns={{ minWidth: 460, max: 2 }} gap={4} align="start">
                  <div className="editor-step-col">
                    <ActiveStep onNext={goNext} onPrev={goPrev} />
                  </div>
                  <VStack gap={3} width="100%">
                    <Card padding={0} variant="transparent">
                      <div className="preview-sheet-wrap">
                        <div className="preview-sheet-container">
                          <ResumePreview
                            interactive
                            onEditSection={handleCanvasEdit}
                          />
                        </div>
                      </div>
                    </Card>
                  </VStack>
                </Grid>
              </VStack>
            ) : (
              <FullPagePreview
                onDownloadPdf={handleDownloadPdf}
                onDownloadDocx={handleDownloadDocx}
                onCustomize={() => setCustomizeOpen(true)}
              >
                <div>
                  <ResumePreview interactive onEditSection={handleCanvasEdit} />
                </div>
              </FullPagePreview>
            )}
          </LayoutContent>
        }
      />
      <SideDrawer
        isOpen={resumeCheckOpen}
        onOpenChange={setResumeCheckOpen}
        title="Resume check"
        subtitle={`${ats.passed}/${ats.total} checks pass — updates as you type`}
      >
        <AtScorePanel
          bare
          data={{
            pd: personalDetails,
            experience: workHistory,
            education,
            skills,
            summary: resumeSummary,
          }}
          onJumpStep={(index) => {
            setMode("editor");
            setResumeCheckOpen(false);
            goToStep(index);
          }}
        />
        <Divider
          orientation="horizontal"
          style={{ margin: "var(--spacing-3) 0" }}
        />
        <CoherencePanel
          bare
          data={{
            pd: personalDetails,
            socialLinks,
            summary: resumeSummary,
            experience: workHistory,
            education,
            skills,
          }}
          onJumpStep={(index) => {
            setMode("editor");
            setResumeCheckOpen(false);
            goToStep(index);
          }}
        />
      </SideDrawer>
      <JobMatchDrawer
        isOpen={jobMatchOpen}
        onOpenChange={setJobMatchOpen}
        data={{
          pd: personalDetails,
          socialLinks,
          summary: resumeSummary,
          experience: workHistory,
          education,
          skills,
          extras: additionalSections,
        }}
      />
      <ImportResumeDialog isOpen={importOpen} onOpenChange={setImportOpen} />
      <TemplateGallery
        isOpen={templateGalleryOpen}
        onOpenChange={setTemplateGalleryOpen}
        settings={resumeSettings}
        onSelect={setResumeSettings}
      />
      <TemplateCustomize
        isOpen={customizeOpen}
        onOpenChange={setCustomizeOpen}
        settings={resumeSettings}
        onSelect={setResumeSettings}
      />
      <AiSettingsDialog
        isOpen={aiSettingsOpen}
        onOpenChange={setAiSettingsOpen}
      />
    </ErrorBoundary>
  );
};

export default EditorPage;

export const EditorPageError = () => {
  return (
    <VStack gap={2} align="center" padding={4}>
      <Text type="large" color="accent">
        Something went wrong
      </Text>
    </VStack>
  );
};
