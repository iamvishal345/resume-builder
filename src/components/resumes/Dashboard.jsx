import React, { useEffect, useRef, useState } from "react";
import {
  Layout,
  LayoutContent,
  VStack,
  HStack,
} from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Text } from "@astryxdesign/core/Text";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { EmptyState } from "@astryxdesign/core/EmptyState";
import { List } from "@astryxdesign/core/List";
import {
  Plus,
  Trash2,
  FileText,
  AlertTriangle,
  Upload,
  Shield,
  Sparkles,
} from "lucide-react";
import {
  listResumes,
  getResume,
  putResume,
  deleteResume,
  newResume,
  migrateLegacyLocalStorage,
  clearAllResumes,
} from "@features/resumes/db";
import {
  seedDemoResumes,
  ensureDemoResumes,
} from "@features/resumes/seedDemo";
import { getDemoMode, setDemoMode } from "@features/resumes/prefs";
import {
  readResumeBackupFile,
  restoreFromText,
} from "@features/resumes/backup";
import { resolveTemplate } from "@features/resume/templates";
import TemplateGallery from "../preview/TemplateGallery";
import TemplateCustomize from "../preview/TemplateCustomize";
import PreviewDialog from "./PreviewDialog";
import LetterDialog from "./LetterDialog";
import ResumeListItem from "./ResumeListItem";
import TailorDialog from "./TailorDialog";
import InterviewPacketDialog from "./InterviewPacketDialog";
import DataOwnership from "./DataOwnership";
import { nameOf, relativeTime } from "./resumeMeta";
import "./dashboard.css";

const ResumesDashboard = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [previewDoc, setPreviewDoc] = useState(null);
  const [autoPrintPreview, setAutoPrintPreview] = useState(false);
  const [coverDoc, setCoverDoc] = useState(null);
  const [galleryDoc, setGalleryDoc] = useState(null);
  const [customizeDoc, setCustomizeDoc] = useState(null);
  const [tailorDoc, setTailorDoc] = useState(null);
  const [packetDoc, setPacketDoc] = useState(null);
  const [deleteDoc, setDeleteDoc] = useState(null);
  const [dataOpen, setDataOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const restoreInputRef = useRef(null);

  const load = async () => {
    try {
      await migrateLegacyLocalStorage();
      const mode = getDemoMode();
      if (mode === "on") {
        await ensureDemoResumes();
      } else if (mode === "once") {
        await seedDemoResumes();
        setDemoMode("off");
      }
      const docs = await listResumes();
      setList(docs);
      setError("");
    } catch (e) {
      setError(e && e.message ? e.message : "Could not load your resumes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onFocus = () => {
      listResumes()
        .then(setList)
        .catch(() => {});
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  const createNew = async () => {
    const doc = newResume("Untitled resume");
    await putResume(doc);
    window.location.href = `/editor?resume=${doc.id}`;
  };

  const duplicate = async (doc) => {
    const copy = newResume(`${nameOf(doc)} (copy)`, doc.data);
    await putResume(copy);
    await load();
  };

  const remove = async (doc) => {
    const { deleteVersionsForResume } = await import("@features/resumes/versions");
    await deleteVersionsForResume(doc.id);
    await deleteResume(doc.id);
    setDeleteDoc(null);
    await load();
  };

  const restoreBackupFile = async (file) => {
    if (!file) return;
    try {
      const text = await readResumeBackupFile(file);
      const result = await restoreFromText(text, {
        newResume,
        putResume,
        clearAllResumes,
        mode: "merge",
      });
      if (!result.ok) {
        setMessage({ kind: "error", text: result.error });
        return;
      }
      await load();
      setMessage({
        kind: "ok",
        text:
          result.kind === "pack"
            ? `Restored ${result.count} resume(s) from pack.`
            : `Restored "${result.doc.name}" from backup.`,
      });
    } catch (e) {
      setMessage({
        kind: "error",
        text: e && e.message ? e.message : "Could not restore that file.",
      });
    } finally {
      if (restoreInputRef.current) restoreInputRef.current.value = "";
    }
  };

  const onDrop = async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []);
    for (const file of files) {
      await restoreBackupFile(file);
    }
  };

  useEffect(() => {
    const onDragOver = (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
    };
    window.addEventListener("dragover", onDragOver);
    window.addEventListener("drop", onDrop);
    return () => {
      window.removeEventListener("dragover", onDragOver);
      window.removeEventListener("drop", onDrop);
    };
  }, []);

  const updateSettings = async (doc, patch) => {
    const current = await getResume(doc.id);
    if (!current) return;
    current.data.resumeSettings = {
      ...(current.data.resumeSettings || {}),
      ...patch,
    };
    current.updatedAt = Date.now();
    current.name = nameOf(current);
    await putResume(current);
    await load();
  };

  const rowMeta = (doc) => {
    const template = resolveTemplate(doc.data.resumeSettings?.templateId);
    const tmplName = template ? template.name : "Default";
    return `${tmplName} · Updated ${relativeTime(doc.updatedAt)}`;
  };

  return (
    <Layout height="auto" padding={3} contentWidth={1080}>
      <LayoutContent role="main">
        <div className="rdash-shell">
        <VStack gap={4} width="100%">
          <div className="rdash-header">
            <VStack gap={0}>
              <Text type="inherit" size="xl" weight="semibold" color="primary">
                Your resumes
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                Local-only library (IndexedDB). Drop a .r.json or .cavren.json
                anywhere to restore. Nothing is uploaded.
              </Text>
            </VStack>
            <div className="rdash-header-actions">
              <Button
                variant="ghost"
                size="sm"
                icon={<Shield size={15} />}
                label="Data & privacy"
                onClick={() => setDataOpen(true)}
              />
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload size={15} />}
                label="Restore"
                onClick={() => restoreInputRef.current?.click()}
              />
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={15} />}
                label="New resume"
                onClick={createNew}
              />
            </div>
          </div>

          <input
            ref={restoreInputRef}
            type="file"
            accept=".json,.r.json,.cavren.json,application/json"
            multiple
            style={{ display: "none" }}
            onChange={(event) => {
              const files = Array.from(event.target.files || []);
              for (const file of files) restoreBackupFile(file);
            }}
          />

          {message && (
            <Card
              variant={message.kind === "ok" ? "green" : "red"}
              padding={3}
              width="100%"
            >
              <HStack gap={2} align="center">
                {message.kind === "ok" ? (
                  <Upload size={15} />
                ) : (
                  <AlertTriangle size={15} />
                )}
                <Text type="inherit" size="sm">
                  {message.text}
                </Text>
              </HStack>
            </Card>
          )}

          {error && (
            <Card variant="muted" padding={3} width="100%">
              <HStack gap={2} align="center">
                <AlertTriangle size={15} />
                <Text type="inherit" size="sm">
                  {error}
                </Text>
              </HStack>
            </Card>
          )}

          {loading ? (
            <Card padding={4} width="100%">
              <Text type="inherit" size="sm" color="secondary">
                Loading resumes…
              </Text>
            </Card>
          ) : list.length === 0 ? (
            <EmptyState
              icon={<FileText size={26} />}
              title="No resumes yet"
              description="Create a resume, restore a backup, or load demo templates — all stay on this device."
              actions={
                <HStack gap={2} wrap>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus size={15} />}
                    label="Create resume"
                    onClick={createNew}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={<Sparkles size={15} />}
                    label="Load demos"
                    onClick={async () => {
                      setDemoMode("on");
                      await seedDemoResumes();
                      await load();
                    }}
                  />
                </HStack>
              }
            />
          ) : (
            <Card padding={2} width="100%">
              <List hasDividers density="spacious">
                {list.map((doc) => (
                  <ResumeListItem
                    key={doc.id}
                    doc={doc}
                    description={rowMeta(doc)}
                    onPreview={setPreviewDoc}
                    onDownloadPdf={(item) => {
                      setAutoPrintPreview(true);
                      setPreviewDoc(item);
                    }}
                    onCoverLetter={setCoverDoc}
                    onInterviewPacket={setPacketDoc}
                    onChangeTemplate={setGalleryDoc}
                    onChangeTheme={setCustomizeDoc}
                    onDuplicate={duplicate}
                    onTailor={setTailorDoc}
                    onDelete={setDeleteDoc}
                  />
                ))}
              </List>
            </Card>
          )}
        </VStack>
        </div>
      </LayoutContent>

      <PreviewDialog
        doc={previewDoc}
        autoPrint={autoPrintPreview}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDoc(null);
            setAutoPrintPreview(false);
          }
        }}
      />
      <LetterDialog doc={coverDoc} onOpenChange={setCoverDoc} />
      <TailorDialog doc={tailorDoc} onOpenChange={setTailorDoc} />
      <InterviewPacketDialog doc={packetDoc} onOpenChange={setPacketDoc} />
      <DataOwnership
        open={dataOpen}
        onOpenChange={setDataOpen}
        onChanged={load}
      />

      <TemplateGallery
        isOpen={!!galleryDoc}
        onOpenChange={(open) => !open && setGalleryDoc(null)}
        settings={galleryDoc?.data?.resumeSettings}
        onSelect={(patch) => galleryDoc && updateSettings(galleryDoc, patch)}
      />
      <TemplateCustomize
        isOpen={!!customizeDoc}
        onOpenChange={(open) => !open && setCustomizeDoc(null)}
        settings={customizeDoc?.data?.resumeSettings}
        onSelect={(patch) =>
          customizeDoc && updateSettings(customizeDoc, patch)
        }
      />

      <Dialog
        isOpen={!!deleteDoc}
        onOpenChange={(open) => !open && setDeleteDoc(null)}
        width={420}
        padding={2}
      >
        <DialogHeader
          title="Delete this resume?"
          subtitle={
            deleteDoc
              ? `"${nameOf(deleteDoc)}" will be removed from this browser. This cannot be undone.`
              : ""
          }
          onOpenChange={(open) => !open && setDeleteDoc(null)}
        />
        <VStack gap={3} width="100%" padding={2}>
          <HStack justify="end" width="100%" gap={2}>
            <Button
              variant="ghost"
              size="sm"
              label="Cancel"
              onClick={() => setDeleteDoc(null)}
            />
            <Button
              variant="destructive"
              size="sm"
              icon={<Trash2 size={14} />}
              label="Delete"
              onClick={() => deleteDoc && remove(deleteDoc)}
            />
          </HStack>
        </VStack>
      </Dialog>
    </Layout>
  );
};

export default ResumesDashboard;
