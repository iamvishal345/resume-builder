import { useState, useEffect, useRef, useMemo } from "react";
import {
  Layout,
  LayoutContent,
  VStack,
  HStack,
} from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Divider } from "@astryxdesign/core/Divider";
import { LayoutTemplate, Palette } from "lucide-react";
import { Text } from "@astryxdesign/core/Text";
import ErrorBoundary from "@routes/ErrorBoundary";
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
import Stepper, { STEPS } from "./Stepper";
import EditorTopbar from "./EditorTopbar";
import CommandPalette from "./CommandPalette";
import VersionsPanel from "./VersionsPanel";
import { computeResumeScore } from "@features/ats/score";
import { findWeakBullets, metricsHint } from "@features/ats/metrics";
import { nextFitPreset } from "@features/resume/pageFit";
import { buildResumeDocx, downloadDocx } from "@features/export/docx";
import { getPalette } from "@features/resume/palettes";
import { resumeViewModel } from "@features/resume/viewModel";
import {
  useStore,
  resumeDataOf,
  defaultResumeData,
} from "@store";
import { getResume, putResume, newResume } from "@features/resumes/db";
import { saveVersion } from "@features/resumes/versions";
import { downloadResumePdf } from "@features/export/pdf";
import PersonalDetails from "./steps/PersonalDetails";
import WorkHistory from "./steps/WorkHistory";
import Education from "./steps/Education";
import Skills from "./steps/Skills";
import Summary from "./steps/Summary";
import AdditionalSections from "./steps/AdditionalSections";

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
  const baselineName = useRef("");

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
      if (apply) apply(doc.data);
      createdAtRef.current = doc.createdAt;
      docName.current = doc.name || "Untitled resume";
      baselineName.current = "";
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
    const onKey = (event) => {
      const mod = event.metaKey || event.ctrlKey;
      if (mod && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
        return;
      }
      if (mode !== "editor") return;
      const target = event.target;
      const typing =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);
      if (typing) return;
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
      if (mod && event.key >= "1" && event.key <= "6") {
        event.preventDefault();
        goToStep(Number(event.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const isLastStep = stepIndex === STEPS.length - 1;
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
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [exportError, setExportError] = useState("");
  const [fitNote, setFitNote] = useState("");

  const personalDetails = useStore((state) => state.personalDetails);
  const socialLinks = useStore((state) => state.socialLinks);
  const resumeSummary = useStore((state) => state.resumeSummary);
  const workHistory = useStore((state) => state.workHistory);
  const education = useStore((state) => state.education);
  const skills = useStore((state) => state.skills);
  const additionalSections = useStore((state) => state.additionalSections);

  const resumeData = useMemo(
    () =>
      resumeViewModel({
        personalDetails,
        socialLinks,
        resumeSummary,
        workHistory,
        education,
        skills,
        additionalSections,
      }),
    [
      personalDetails,
      socialLinks,
      resumeSummary,
      workHistory,
      education,
      skills,
      additionalSections,
    ],
  );

  const ats = useMemo(
    () =>
      computeResumeScore({
        pd: resumeData.pd,
        experience: resumeData.experience,
        education: resumeData.education,
        skills: resumeData.skills,
        summary: resumeData.summary,
        extras: resumeData.extras,
      }),
    [resumeData],
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
    setExportError("");
    try {
      await downloadResumePdf({
        data: resumeData,
        templateId: resumeSettings.templateId,
        paletteId: resumeSettings.paletteId,
        fontId: resumeSettings.fontId,
        settings: resumeSettings,
      });
    } catch (error) {
      setExportError(
        error?.message || "PDF export failed. Try again in a moment.",
      );
    }
  };

  const handleDownloadDocx = async () => {
    setExportError("");
    try {
      const palette = getPalette(resumeSettings.paletteId);
      const fontId = resumeSettings.fontId ?? "sans";
      const blob = await buildResumeDocx(resumeData, {
        palette,
        fontId,
        settings: resumeSettings,
      });
      const name =
        [resumeData.pd?.firstName, resumeData.pd?.lastName]
          .filter(Boolean)
          .join(" ") || "resume";
      await downloadDocx(blob, name);
    } catch (error) {
      setExportError(
        error?.message || "DOCX export failed. Try again in a moment.",
      );
    }
  };

  const handleFitPage = () => {
    const next = nextFitPreset(resumeSettings);
    setResumeSettings(next);
    setFitNote(
      `Density set to ${next.fontSize}px / ${next.lineHeight} line height. Click again to tighten further, or Customize to reset.`,
    );
  };

  const commandActions = useMemo(
    () => [
      ...STEPS.map((step, i) => ({
        id: `step-${step.id}`,
        label: `Go to ${step.label || step.title || step.id}`,
        hint: `⌘${i + 1}`,
        keywords: step.id,
        run: () => {
          setMode("editor");
          goToStep(i);
        },
      })),
      {
        id: "preview",
        label: "Preview mode",
        run: () => setMode("preview"),
      },
      {
        id: "letter",
        label: "Cover letter",
        run: () => setMode("letter"),
      },
      {
        id: "check",
        label: "Resume check",
        run: () => setResumeCheckOpen(true),
      },
      {
        id: "match",
        label: "Job match",
        run: () => setJobMatchOpen(true),
      },
      {
        id: "import",
        label: "Import resume",
        run: () => setImportOpen(true),
      },
      {
        id: "templates",
        label: "Templates",
        run: () => setTemplateGalleryOpen(true),
      },
      {
        id: "customize",
        label: "Customize theme",
        run: () => setCustomizeOpen(true),
      },
      {
        id: "versions",
        label: "Versions / snapshots",
        run: () => setVersionsOpen(true),
      },
      {
        id: "fit",
        label: "Fit to one page",
        run: handleFitPage,
      },
      {
        id: "pdf",
        label: "Download PDF",
        run: handleDownloadPdf,
      },
      {
        id: "docx",
        label: "Download DOCX",
        run: handleDownloadDocx,
      },
      {
        id: "snapshot",
        label: "Save snapshot now",
        run: async () => {
          if (!resumeId) return;
          await saveVersion(resumeId, resumeDataOf(useStore.getState()));
          setVersionsOpen(true);
        },
      },
      {
        id: "library",
        label: "My resumes",
        run: () => {
          window.location.href = "/resumes";
        },
      },
    ],
    [resumeId, resumeSettings],
  );

  return (
    <ErrorBoundary>
      <Layout
        height="auto"
        padding={3}
        contentWidth={1400}
        className="editor-page-layout"
        header={
          <EditorTopbar
            mode={mode}
            onModeChange={setMode}
            theme={theme}
            onToggleTheme={toggleTheme}
            onAiSettings={() => setAiSettingsOpen(true)}
            autosaveLabel={autosaveLabel}
            canUndo={canUndo}
            canRedo={canRedo}
            onUndo={undo}
            onRedo={redo}
            onImport={() => setImportOpen(true)}
            atsScore={ats.score}
            onResumeCheck={() => setResumeCheckOpen(true)}
            onJobMatch={() => setJobMatchOpen(true)}
            onDownloadDocx={handleDownloadDocx}
            onDownloadPdf={handleDownloadPdf}
            onVersions={() => setVersionsOpen(true)}
            onFitPage={handleFitPage}
            onCommandPalette={() => setPaletteOpen(true)}
            exportError={exportError || fitNote}
          />
        }
        content={
          <LayoutContent isScrollable={false} padding={4} className="editor-layout-content">
            {mode === "letter" ? (
              <CoverLetterEditor />
            ) : mode === "editor" ? (
              <div className="editor-shell">
                <div className="editor-tools-row">
                  <Stepper stepIndex={stepIndex} onJump={goToStep} />
                  <HStack gap={2} wrap>
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
                </div>
                <div className="editor-workspace">
                  <div className="editor-form-pane">
                    <ActiveStep
                      onNext={
                        isLastStep ? () => setMode("preview") : goNext
                      }
                      onPrev={stepIndex > 0 ? goPrev : undefined}
                      nextLabel={isLastStep ? "Finish" : "Next"}
                    />
                  </div>
                  <aside className="editor-preview-pane" aria-label="Live resume preview">
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
                  </aside>
                </div>
                <button
                  type="button"
                  className="editor-mobile-preview-fab"
                  onClick={() => setMode("preview")}
                >
                  Preview resume
                </button>
              </div>
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
            pd: resumeData.pd,
            experience: resumeData.experience,
            education: resumeData.education,
            skills: resumeData.skills,
            summary: resumeData.summary,
            extras: resumeData.extras,
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
            pd: resumeData.pd,
            socialLinks: resumeData.socialLinks,
            summary: resumeData.summary,
            experience: resumeData.experience,
            education: resumeData.education,
            skills: resumeData.skills,
          }}
          onJumpStep={(index) => {
            setMode("editor");
            setResumeCheckOpen(false);
            goToStep(index);
          }}
        />
        {findWeakBullets(workHistory).length > 0 ? (
          <>
            <Divider
              orientation="horizontal"
              style={{ margin: "var(--spacing-3) 0" }}
            />
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Achievement prompts
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {metricsHint}
              </Text>
              {findWeakBullets(workHistory)
                .slice(0, 3)
                .map((row) => (
                  <Text key={row.index} type="inherit" size="sm" color="secondary">
                    {row.role}
                    {row.company ? ` · ${row.company}` : ""}: {row.weak.length}{" "}
                    bullet(s) without numbers
                  </Text>
                ))}
            </VStack>
          </>
        ) : null}
      </SideDrawer>
      <JobMatchDrawer
        isOpen={jobMatchOpen}
        onOpenChange={setJobMatchOpen}
        data={resumeData}
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
      <VersionsPanel
        open={versionsOpen}
        onOpenChange={setVersionsOpen}
        resumeId={resumeId}
      />
      <CommandPalette
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        actions={commandActions}
      />
    </ErrorBoundary>
  );
};

export default EditorPage;
