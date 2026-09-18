import { useRef, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Cloud,
  Sparkles,
} from "lucide-react";
import {
  listResumes,
  clearAllResumes,
  newResume,
  putResume,
} from "@features/resumes/db";
import {
  exportBackupPack,
  readResumeBackupFile,
  restoreFromText,
} from "@features/resumes/backup";
import {
  getDemoMode,
  setDemoMode,
  getGoogleClientId,
  setGoogleClientId,
} from "@features/resumes/prefs";
import {
  seedDemoResumes,
  clearDemoResumes,
  isDemoResumeId,
} from "@features/resumes/seedDemo";
import {
  isDriveConfigured,
  uploadBackupToDrive,
  downloadBackupFromDrive,
} from "@features/resumes/drive";
import { listVersions } from "@features/resumes/versions";

const DataOwnership = ({ open, onOpenChange, onChanged }) => {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [demoMode, setDemoModeState] = useState(getDemoMode);
  const [clientId, setClientId] = useState(getGoogleClientId);
  const [restoreMode, setRestoreMode] = useState("merge");
  const packInputRef = useRef(null);

  const refresh = async () => {
    onChanged?.();
  };

  const withBusy = async (label, fn) => {
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setBusy("");
    }
  };

  const exportAll = () =>
    withBusy("export", async () => {
      const docs = await listResumes();
      const versions = [];
      for (const doc of docs) {
        if (isDemoResumeId(doc.id)) continue;
        const vs = await listVersions(doc.id);
        versions.push(...vs);
      }
      const userDocs = docs.filter((d) => !isDemoResumeId(d.id));
      exportBackupPack(userDocs.length ? userDocs : docs, { versions });
      setMessage("Backup downloaded to your computer.");
    });

  const restorePack = async (file) => {
    await withBusy("restore", async () => {
      const text = await readResumeBackupFile(file);
      const result = await restoreFromText(text, {
        newResume,
        putResume,
        clearAllResumes,
        mode: restoreMode,
      });
      if (!result.ok) throw new Error(result.error);
      if (result.prefs?.demos) {
        setDemoMode(result.prefs.demos);
        setDemoModeState(result.prefs.demos);
      }
      setMessage(
        result.kind === "pack"
          ? `Restored ${result.count} resume(s) (${restoreMode}).`
          : "Resume restored.",
      );
      await refresh();
    });
  };

  const clearEverything = () =>
    withBusy("clear", async () => {
      if (
        !window.confirm(
          "Delete ALL resumes and snapshots from this browser? This cannot be undone.",
        )
      ) {
        return;
      }
      const n = await clearAllResumes();
      setDemoMode("off");
      setDemoModeState("off");
      setMessage(`Cleared ${n} resume(s) from this device.`);
      await refresh();
    });

  const loadDemos = () =>
    withBusy("demos", async () => {
      setDemoMode("on");
      setDemoModeState("on");
      const n = await seedDemoResumes();
      setMessage(`Loaded ${n} demo resumes.`);
      await refresh();
    });

  const removeDemos = () =>
    withBusy("demos", async () => {
      const n = await clearDemoResumes();
      setDemoMode("off");
      setDemoModeState("off");
      setMessage(`Removed ${n} demo resume(s).`);
      await refresh();
    });

  const driveBackup = () =>
    withBusy("drive", async () => {
      const docs = (await listResumes()).filter((d) => !isDemoResumeId(d.id));
      await uploadBackupToDrive(docs);
      setMessage("Backup saved to your Google Drive.");
    });

  const driveRestore = () =>
    withBusy("drive", async () => {
      const text = await downloadBackupFromDrive();
      const result = await restoreFromText(text, {
        newResume,
        putResume,
        clearAllResumes,
        mode: "merge",
      });
      if (!result.ok) throw new Error(result.error);
      setMessage(`Restored ${result.count || 1} from Drive.`);
      await refresh();
    });

  return (
    <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      width={560}
      maxHeight="85dvh"
      padding={2}
    >
      <DialogHeader
        title="Data & privacy"
        subtitle="Everything stays on this device unless you export or choose Drive."
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={3} width="100%" padding={2}>
          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                On this device
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                Resumes live in IndexedDB in your browser. Downloads (PDF, DOCX,
                .r.json, .cavren.json) are files on your computer. Cavren has no
                server for your content and does not harvest analytics.
              </Text>
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Full backup pack
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                Move to another computer: download one pack, restore with merge
                or replace.
              </Text>
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Download size={14} />}
                  label={busy === "export" ? "Exporting…" : "Download backup"}
                  disabled={!!busy}
                  onClick={exportAll}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Upload size={14} />}
                  label="Restore pack"
                  disabled={!!busy}
                  onClick={() => packInputRef.current?.click()}
                />
              </HStack>
              <HStack gap={2} align="center">
                <Button
                  size="sm"
                  variant={restoreMode === "merge" ? "primary" : "ghost"}
                  label="Merge"
                  onClick={() => setRestoreMode("merge")}
                />
                <Button
                  size="sm"
                  variant={restoreMode === "replace" ? "primary" : "ghost"}
                  label="Replace all"
                  onClick={() => setRestoreMode("replace")}
                />
              </HStack>
              <input
                ref={packInputRef}
                type="file"
                accept=".json,.cavren.json,application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) restorePack(file);
                  e.target.value = "";
                }}
              />
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Demo resumes
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                Template samples are opt-in. Current: {demoMode}.
              </Text>
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Sparkles size={14} />}
                  label="Load demos"
                  disabled={!!busy}
                  onClick={loadDemos}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  label="Remove demos"
                  disabled={!!busy}
                  onClick={removeDemos}
                />
              </HStack>
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Google Drive (optional)
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                Client-side only. Paste your OAuth client ID (or set
                PUBLIC_GOOGLE_CLIENT_ID). File goes to your Drive — not to
                Cavren.
              </Text>
              <TextInput
                label="Google OAuth client ID"
                value={clientId}
                onChange={setClientId}
                width="100%"
              />
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  label="Save client ID"
                  onClick={() => {
                    setGoogleClientId(clientId);
                    setMessage("Client ID saved in this browser.");
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Cloud size={14} />}
                  label="Backup to Drive"
                  disabled={!!busy || !isDriveConfigured()}
                  onClick={driveBackup}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<HardDrive size={14} />}
                  label="Restore from Drive"
                  disabled={!!busy || !isDriveConfigured()}
                  onClick={driveRestore}
                />
              </HStack>
            </VStack>
          </Card>

          <Card padding={3} width="100%" variant="red">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Danger zone
              </Text>
              <Button
                size="sm"
                variant="destructive"
                icon={<Trash2 size={14} />}
                label={busy === "clear" ? "Clearing…" : "Clear all local data"}
                disabled={!!busy}
                onClick={clearEverything}
              />
            </VStack>
          </Card>

          {message && (
            <Text type="inherit" size="sm" color="accent">
              {message}
            </Text>
          )}
          {error && (
            <Text type="inherit" size="sm" color="accent" role="alert">
              {error}
            </Text>
          )}
        </VStack>
      </div>
    </Dialog>
  );
};

export default DataOwnership;
