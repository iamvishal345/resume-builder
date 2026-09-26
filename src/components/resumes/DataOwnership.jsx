import { useEffect, useRef, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Text } from "@astryxdesign/core/Text";
import { Card } from "@astryxdesign/core/Card";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { AlertDialog } from "@astryxdesign/core/AlertDialog";
import {
  Download,
  Upload,
  Trash2,
  HardDrive,
  Cloud,
  Sparkles,
  WifiOff,
  Lock,
} from "lucide-react";
import {
  listResumes,
  clearAllResumes,
  newResume,
  putResume,
  clearLegacyMigrationFlag,
} from "@features/resumes/db";
import {
  exportBackupPack,
  buildBackupPack,
  readResumeBackupFile,
  restoreFromText,
  triggerDownload,
} from "@features/resumes/backup";
import {
  encryptBackupPack,
  decryptBackupPack,
  parseEncryptedBackupText,
  ENC_FILE_EXT,
} from "@features/resumes/encryptedBackup";
import { useI18n } from "@features/i18n/useI18n";
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
  signOutDrive,
} from "@features/resumes/drive";
import { clearAiConfig } from "@features/ai/provider";
import { listVersions } from "@features/resumes/versions";
import { estimateLocalStorage } from "@features/resumes/storageStats";

const DataOwnership = ({ open, onOpenChange, onChanged }) => {
  const { t } = useI18n();
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [demoMode, setDemoModeState] = useState(getDemoMode);
  const [clientId, setClientId] = useState(getGoogleClientId);
  const [restoreMode, setRestoreMode] = useState("merge");
  const [storageInfo, setStorageInfo] = useState(null);
  const [passphrase, setPassphrase] = useState("");
  const [passphrase2, setPassphrase2] = useState("");
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const packInputRef = useRef(null);
  const encInputRef = useRef(null);
  const driveReady = isDriveConfigured();

  const refreshStorage = async () => {
    try {
      setStorageInfo(await estimateLocalStorage());
    } catch {
      setStorageInfo(null);
    }
  };

  useEffect(() => {
    if (open) {
      setClientId(getGoogleClientId());
      refreshStorage();
    }
  }, [open]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const refresh = async () => {
    onChanged?.();
    await refreshStorage();
  };

  const withBusy = async (label, fn) => {
    setBusy(label);
    setError("");
    setMessage("");
    try {
      await fn();
    } catch (e) {
      setError(e?.message || t("errors.somethingWentWrong"));
    } finally {
      setBusy("");
    }
  };

  const collectUserPack = async () => {
    const docs = await listResumes();
    const versions = [];
    for (const doc of docs) {
      if (isDemoResumeId(doc.id)) continue;
      const vs = await listVersions(doc.id);
      versions.push(...vs);
    }
    const userDocs = docs.filter((d) => !isDemoResumeId(d.id));
    return buildBackupPack(userDocs.length ? userDocs : docs, { versions });
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
      setMessage(t("ownership.backupDownloadedMsg") || "Backup downloaded to your computer.");
    });

  const exportEncrypted = () =>
    withBusy("enc-export", async () => {
      if (passphrase.length < 8) throw new Error(t("backup.weak"));
      if (passphrase !== passphrase2) throw new Error(t("backup.mismatch"));
      const pack = await collectUserPack();
      const envelope = await encryptBackupPack(pack, passphrase);
      const stamp = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(envelope, null, 2)], {
        type: "application/json",
      });
      triggerDownload(blob, `cavren-backup-${stamp}${ENC_FILE_EXT}`);
      setPassphrase("");
      setPassphrase2("");
      setMessage(t("ownership.encBackupDownloadedMsg") || "Encrypted backup downloaded to your computer.");
    });

  const restorePack = async (file) => {
    await withBusy("restore", async () => {
      const text = await readResumeBackupFile(file);
      const enc = parseEncryptedBackupText(text);
      if (enc.ok) {
        throw new Error(
          `${t("backup.needPassphrase")} Use “${t("backup.restoreEncrypted")}”.`,
        );
      }
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
          ? (t("ownership.restoredCountMsg", { count: result.count, mode: restoreMode }) || `Restored ${result.count} resume(s) (${restoreMode}).`)
          : (t("ownership.resumeRestoredMsg") || "Resume restored."),
      );
      await refresh();
    });
  };

  const restoreEncrypted = async (file) => {
    await withBusy("enc-restore", async () => {
      if (!passphrase) throw new Error(t("backup.needPassphrase"));
      const text = await readResumeBackupFile(file);
      const parsed = parseEncryptedBackupText(text);
      if (!parsed.ok) throw new Error(parsed.error);
      let pack;
      try {
        pack = await decryptBackupPack(parsed.envelope, passphrase);
      } catch (e) {
        throw new Error(e?.message || t("backup.wrongPass"));
      }
      const result = await restoreFromText(JSON.stringify(pack), {
        newResume,
        putResume,
        clearAllResumes,
        mode: restoreMode,
      });
      if (!result.ok) throw new Error(result.error);
      setPassphrase("");
      setPassphrase2("");
      setMessage(
        t("ownership.restoredEncCountMsg", { count: result.count || 1, mode: restoreMode }) || `Restored ${result.count || 1} resume(s) from encrypted backup (${restoreMode}).`,
      );
      await refresh();
    });
  };

  const clearEverything = () =>
    withBusy("clear", async () => {
      const n = await clearAllResumes();
      clearLegacyMigrationFlag();
      clearAiConfig();
      signOutDrive();
      setGoogleClientId(null);
      setClientId("");
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        /* private mode */
      }
      setDemoMode("off");
      setDemoModeState("off");
      setMessage(
        t("ownership.clearedEverythingMsg", { count: n }) || `Cleared ${n} resume(s), saved API keys, credentials, and settings from this device.`,
      );
      await refresh();
    });

  const loadDemos = () =>
    withBusy("demos", async () => {
      setDemoMode("on");
      setDemoModeState("on");
      const n = await seedDemoResumes();
      setMessage(t("ownership.loadedDemosMsg", { count: n }) || `Loaded ${n} demo resumes.`);
      await refresh();
    });

  const removeDemos = () =>
    withBusy("demos", async () => {
      const n = await clearDemoResumes();
      setDemoMode("off");
      setDemoModeState("off");
      setMessage(t("ownership.removedDemosMsg", { count: n }) || `Removed ${n} demo resume(s).`);
      await refresh();
    });

  const driveBackup = () =>
    withBusy("drive", async () => {
      if (!navigator.onLine) {
        throw new Error(t("errors.driveOfflineBackup"));
      }
      if (!isDriveConfigured()) {
        throw new Error(t("errors.driveNeedsClientId"));
      }
      const pack = await collectUserPack();
      await uploadBackupToDrive(pack);
      setMessage(t("ownership.savedDriveMessage") || "Backup saved to your Google Drive.");
    });

  const driveRestore = () =>
    withBusy("drive", async () => {
      if (!navigator.onLine) {
        throw new Error(t("errors.driveOfflineRestore"));
      }
      if (!isDriveConfigured()) {
        throw new Error(t("errors.driveNeedsClientId"));
      }
      const text = await downloadBackupFromDrive();
      const result = await restoreFromText(text, {
        newResume,
        putResume,
        clearAllResumes,
        mode: "merge",
      });
      if (!result.ok) throw new Error(result.error);
      setMessage(t("ownership.restoredDriveMessage", { count: result.count || 1 }) || `Restored ${result.count || 1} from Drive.`);
      await refresh();
    });

  return (
    <>
      <Dialog
      isOpen={open}
      onOpenChange={onOpenChange}
      width={560}
      maxHeight="85dvh"
      padding={2}
    >
      <DialogHeader
        title={t("ownership.dialogTitle") || "Data & privacy"}
        subtitle={t("ownership.dialogSubtitle") || "Everything stays on this device unless you export or choose Drive."}
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={3} width="100%" padding={2}>
          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.deviceTitle") || "On this device"}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("ownership.deviceDesc") || "Resumes live in IndexedDB in your browser. Downloads (PDF, DOCX, .r.json, .cavren.json) are files on your computer. Cavren has no server for your content and does not harvest analytics."}
              </Text>
              {storageInfo ? (
                <Text type="inherit" size="sm" color="secondary">
                  {storageInfo.resumes} resume(s)
                  {storageInfo.demos
                    ? ` · ${storageInfo.demos} demo(s)`
                    : ""}{" "}
                  · {storageInfo.versions} snapshot(s)
                  {storageInfo.usageLabel
                    ? ` · ~${storageInfo.usageLabel} used`
                    : ""}
                  {storageInfo.quotaLabel
                    ? ` of ~${storageInfo.quotaLabel}`
                    : ""}
                </Text>
              ) : null}
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.backupTitle") || "Full backup pack"}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("ownership.backupDesc") || "Move to another computer: download one pack, restore with merge or replace. Works fully offline."}
              </Text>
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="primary"
                  icon={<Download size={14} />}
                  label={busy === "export" ? (t("ownership.exporting") || "Exporting…") : (t("ownership.downloadBackup") || "Download backup")}
                  disabled={!!busy}
                  onClick={exportAll}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Upload size={14} />}
                  label={t("ownership.restorePack") || "Restore pack"}
                  disabled={!!busy}
                  onClick={() => packInputRef.current?.click()}
                />
              </HStack>
              <HStack gap={2} align="center">
                <Button
                  size="sm"
                  variant={restoreMode === "merge" ? "primary" : "ghost"}
                  label={t("ownership.merge") || "Merge"}
                  onClick={() => setRestoreMode("merge")}
                />
                <Button
                  size="sm"
                  variant={restoreMode === "replace" ? "primary" : "ghost"}
                  label={t("ownership.replaceAll") || "Replace all"}
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
            <form onSubmit={(e) => e.preventDefault()} style={{ width: "100%" }}>
              <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("backup.encryptedTitle")}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("backup.encryptedBody")}
              </Text>
              <TextInput
                label={t("backup.passphrase")}
                type="password"
                autoComplete="new-password"
                value={passphrase}
                onChange={setPassphrase}
                width="100%"
              />
              <TextInput
                label={t("backup.passphraseConfirm")}
                type="password"
                autoComplete="new-password"
                value={passphrase2}
                onChange={setPassphrase2}
                width="100%"
              />
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Lock size={14} />}
                  label={
                    busy === "enc-export"
                      ? "Encrypting…"
                      : t("backup.downloadEncrypted")
                  }
                  disabled={!!busy}
                  onClick={exportEncrypted}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Upload size={14} />}
                  label={t("backup.restoreEncrypted")}
                  disabled={!!busy}
                  onClick={() => encInputRef.current?.click()}
                />
              </HStack>
              <input
                ref={encInputRef}
                type="file"
                accept=".json,.enc.json,.cavren.enc.json,application/json"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) restoreEncrypted(file);
                  e.target.value = "";
                }}
              />
            </VStack>
          </form>
        </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.demoTitle") || "Demo resumes"}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("ownership.demoDesc", { mode: demoMode }) || `Template samples are opt-in. Current: ${demoMode}.`}
              </Text>
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Sparkles size={14} />}
                  label={t("ownership.loadDemos") || "Load demos"}
                  disabled={!!busy}
                  onClick={loadDemos}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  label={t("ownership.removeDemos") || "Remove demos"}
                  disabled={!!busy}
                  onClick={removeDemos}
                />
              </HStack>
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.portableTitle") || "Portable formats"}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("ownership.portableDescBefore") || "Cavren .r.json / .cavren.json keep settings and themes. Open "}
                <a href="https://jsonresume.org/" target="_blank" rel="noopener noreferrer">
                  JSON Resume
                </a>
                {t("ownership.portableDescAfter") || " files restore into a new resume from the library drop zone. Export JSON Resume from the editor command palette (⌘K)."}
              </Text>
            </VStack>
          </Card>

          <Card padding={3} width="100%">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.driveTitle") || "Google Drive (optional)"}
              </Text>
              <Text type="inherit" size="sm" color="secondary">
                {t("ownership.driveDesc") || "Never required. Core edit, preview, and local backup work offline without Drive. Tokens stay in this browser — Cavren has no server. Full setup steps live in docs/DRIVE.md in the project repo."}
              </Text>
              {!driveReady ? (
                <Text type="inherit" size="sm" color="secondary">
                  {t("ownership.driveNoClient") || "No client ID yet. Create an OAuth client in Google Cloud Console (Web application) and paste it below, or set PUBLIC_GOOGLE_CLIENT_ID at build time."}
                </Text>
              ) : null}
              {!online ? (
                <HStack gap={2} align="center">
                  <WifiOff size={14} />
                  <Text type="inherit" size="sm" color="secondary">
                    {t("ownership.driveOffline") || "You're offline — Drive buttons are disabled. Use Download backup instead."}
                  </Text>
                </HStack>
              ) : null}
              <TextInput
                label={t("ownership.driveClientIdLabel") || "Google OAuth client ID"}
                value={clientId}
                onChange={setClientId}
                width="100%"
              />
              <HStack gap={2} wrap>
                <Button
                  size="sm"
                  variant="secondary"
                  label={t("ownership.saveClientId") || "Save client ID"}
                  onClick={() => {
                    setGoogleClientId(clientId);
                    setMessage(
                      clientId.trim()
                        ? (t("ownership.savedClientIdMessage") || "Client ID saved in this browser.")
                        : (t("ownership.clearedClientIdMessage") || "Client ID cleared."),
                    );
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<Cloud size={14} />}
                  label={t("ownership.backupDrive") || "Backup to Drive"}
                  disabled={!!busy || !driveReady || !online}
                  onClick={driveBackup}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<HardDrive size={14} />}
                  label={t("ownership.restoreDrive") || "Restore from Drive"}
                  disabled={!!busy || !driveReady || !online}
                  onClick={driveRestore}
                />
              </HStack>
            </VStack>
          </Card>

          <Card padding={3} width="100%" variant="red">
            <VStack gap={2} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                {t("ownership.dangerTitle") || "Danger zone"}
              </Text>
              <Button
                size="sm"
                variant="destructive"
                icon={<Trash2 size={14} />}
                label={busy === "clear" ? (t("ownership.clearing") || "Clearing…") : (t("ownership.clearLocalData") || "Clear all local data")}
                disabled={!!busy}
                onClick={() => setClearConfirmOpen(true)}
              />
            </VStack>
          </Card>

          {message && (
            <Text
              type="inherit"
              size="sm"
              color="accent"
              role="status"
              aria-live="polite"
            >
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

    <AlertDialog
      isOpen={clearConfirmOpen}
      onOpenChange={setClearConfirmOpen}
      title={t("ownership.clearConfirmTitle") || "Clear all local data?"}
      description={t("ownership.clearConfirmDesc") || "This will permanently delete all resumes, version snapshots, saved AI API keys, Google Drive credentials, and local preferences from this device. This action cannot be undone."}
      actionLabel={t("ownership.clearConfirmAction") || "Clear all data"}
      actionVariant="destructive"
      cancelLabel={t("common.cancel") || "Cancel"}
      isActionLoading={busy === "clear"}
      onAction={async () => {
        await clearEverything();
        setClearConfirmOpen(false);
      }}
    />
  </>
);
};

export default DataOwnership;
