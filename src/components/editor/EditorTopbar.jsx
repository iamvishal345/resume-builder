import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
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
  Download,
  ClipboardCheck,
  Target,
  Sparkles,
  Undo2,
  Redo2,
  FileDown,
  Upload,
  LayoutDashboard,
  History,
  Minimize2,
  Command,
} from "lucide-react";
import AuthBar from "../auth/AuthBar";
import LocaleSelect from "../LocaleSelect";
import { useI18n } from "@features/i18n/useI18n";

const EditorTopbar = ({
  mode,
  onModeChange,
  theme,
  onToggleTheme,
  onAiSettings,
  autosaveLabel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onImport,
  atsScore,
  onResumeCheck,
  onJobMatch,
  onDownloadDocx,
  onDownloadPdf,
  onVersions,
  onFitPage,
  onCommandPalette,
  exportError,
}) => {
  const { t } = useI18n();
  const themeLabel =
    theme === "dark" ? t("editor.themeToLight") : t("editor.themeToDark");
  const saved = autosaveLabel === "Saved in this browser" || autosaveLabel === t("editor.saved");

  return (
    <VStack gap={2} width="100%" className="editor-topbar">
      <HStack justify="between" align="center" gap={3} width="100%" wrap="wrap">
        <SegmentedControl
          value={mode}
          onChange={onModeChange}
          label={t("editor.view")}
          size="sm"
        >
          <SegmentedControlItem value="editor" label={t("editor.edit")} />
          <SegmentedControlItem value="preview" label={t("editor.preview")} />
          <SegmentedControlItem value="letter" label={t("editor.letter")} />
        </SegmentedControl>
        <HStack gap={2} align="center" wrap="wrap">
          <IconButton
            label={t("editor.command")}
            tooltip={t("editor.command")}
            variant="ghost"
            icon={<Command size={16} />}
            onClick={onCommandPalette}
          />
          <IconButton
            label={t("editor.aiPrefs")}
            tooltip={t("editor.aiPrefs")}
            variant="ghost"
            icon={<Sparkles size={16} />}
            onClick={onAiSettings}
          />
          <IconButton
            label={themeLabel}
            tooltip={themeLabel}
            variant="ghost"
            icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            onClick={onToggleTheme}
          />
          <LocaleSelect />
          <span className="editor-actions-tertiary">
            <AuthBar />
          </span>
        </HStack>
      </HStack>
      {exportError ? (
        <Text type="inherit" size="sm" color="accent" role="alert">
          {exportError}
        </Text>
      ) : null}
      <HStack
        justify="between"
        align="center"
        gap={3}
        width="100%"
        wrap="wrap"
        className="editor-actions"
      >
        <HStack
          gap={2}
          align="center"
          wrap="wrap"
          className="editor-actions-start"
        >
          <Text
            type="inherit"
            size="sm"
            weight="medium"
            color={saved ? "secondary" : "accent"}
          >
            {autosaveLabel}
          </Text>
          <Divider
            orientation="vertical"
            className="editor-actions-divider"
            style={{ height: "var(--spacing-5)" }}
          />
          <HStack gap={0} align="center" wrap="wrap">
            <IconButton
              label={t("editor.undo")}
              tooltip={t("editor.undo")}
              variant="ghost"
              icon={<Undo2 size={16} />}
              disabled={!canUndo}
              onClick={onUndo}
            />
            <IconButton
              label={t("editor.redo")}
              tooltip={t("editor.redo")}
              variant="ghost"
              icon={<Redo2 size={16} />}
              disabled={!canRedo}
              onClick={onRedo}
            />
            <span className="editor-actions-secondary">
              <IconButton
                label={t("editor.versions")}
                tooltip={t("editor.versionsHint")}
                variant="ghost"
                icon={<History size={16} />}
                onClick={onVersions}
              />
            </span>
            <Divider
              orientation="vertical"
              className="editor-actions-divider"
              style={{ height: "var(--spacing-5)" }}
            />
            <IconButton
              label={t("editor.library")}
              tooltip={t("editor.libraryHint")}
              variant="ghost"
              icon={<LayoutDashboard size={16} />}
              onClick={() => {
                window.location.href = "/resumes";
              }}
            />
          </HStack>
        </HStack>
        <HStack gap={2} align="center" wrap="wrap" className="editor-actions-end">
          <span className="editor-actions-cluster editor-actions-secondary">
            <Button
              variant="secondary"
              size="sm"
              icon={<Upload size={14} />}
              label={t("editor.import")}
              onClick={onImport}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Minimize2 size={14} />}
              label={t("editor.fit")}
              onClick={onFitPage}
            />
          </span>
          <Divider
            className="editor-actions-secondary editor-actions-divider"
            orientation="vertical"
            style={{ height: "var(--spacing-5)" }}
          />
          <span className="editor-actions-cluster">
            <Button
              variant="secondary"
              size="sm"
              icon={<ClipboardCheck size={14} />}
              label={`${t("editor.check")} · ${atsScore}`}
              onClick={onResumeCheck}
            />
            <Button
              variant="secondary"
              size="sm"
              icon={<Target size={14} />}
              label={t("editor.match")}
              onClick={onJobMatch}
            />
          </span>
          <Divider
            orientation="vertical"
            className="editor-actions-divider"
            style={{ height: "var(--spacing-5)" }}
          />
          <span className="editor-actions-cluster">
            <Button
              variant="secondary"
              size="sm"
              icon={<FileDown size={14} />}
              label="DOCX"
              onClick={onDownloadDocx}
            />
            <Button
              variant="primary"
              size="sm"
              icon={<Download size={14} />}
              label="PDF"
              onClick={onDownloadPdf}
            />
          </span>
        </HStack>
      </HStack>
    </VStack>
  );
};

export default EditorTopbar;
