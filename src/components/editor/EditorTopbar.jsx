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
}) => (
  <VStack gap={2} width="100%" className="editor-topbar">
    <HStack justify="between" align="center" gap={3} width="100%" wrap>
      <SegmentedControl
        value={mode}
        onChange={onModeChange}
        label="Editor view"
        size="sm"
      >
        <SegmentedControlItem value="editor" label="Edit" />
        <SegmentedControlItem value="preview" label="Preview" />
        <SegmentedControlItem value="letter" label="Letter" />
      </SegmentedControl>
      <HStack gap={2} align="center" wrap>
        <IconButton
          label="Command palette (Ctrl+K)"
          tooltip="Command palette (Ctrl+K)"
          variant="ghost"
          icon={<Command size={16} />}
          onClick={onCommandPalette}
        />
        <IconButton
          label="AI preferences"
          tooltip="AI preferences"
          variant="ghost"
          icon={<Sparkles size={16} />}
          onClick={onAiSettings}
        />
        <IconButton
          label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          tooltip={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          variant="ghost"
          icon={theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          onClick={onToggleTheme}
        />
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
      wrap
      className="editor-actions"
    >
      <HStack gap={2} align="center" wrap>
        <Text
          type="inherit"
          size="sm"
          weight="medium"
          color={
            autosaveLabel === "Saved in this browser" ? "secondary" : "accent"
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
            onClick={onUndo}
          />
          <IconButton
            label="Redo (Ctrl+Shift+Z)"
            tooltip="Redo (Ctrl+Shift+Z)"
            variant="ghost"
            icon={<Redo2 size={16} />}
            disabled={!canRedo}
            onClick={onRedo}
          />
          <span className="editor-actions-secondary">
            <IconButton
              label="Versions"
              tooltip="Local snapshots"
              variant="ghost"
              icon={<History size={16} />}
              onClick={onVersions}
            />
          </span>
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
        <span className="editor-actions-cluster editor-actions-secondary">
          <Button
            variant="secondary"
            size="sm"
            icon={<Upload size={14} />}
            label="Import"
            onClick={onImport}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Minimize2 size={14} />}
            label="Fit 1 page"
            onClick={onFitPage}
          />
        </span>
        <Divider
          className="editor-actions-secondary"
          orientation="vertical"
          style={{ height: "var(--spacing-5)" }}
        />
        <span className="editor-actions-cluster">
          <Button
            variant="secondary"
            size="sm"
            icon={<ClipboardCheck size={14} />}
            label={`Check · ${atsScore}`}
            onClick={onResumeCheck}
          />
          <Button
            variant="secondary"
            size="sm"
            icon={<Target size={14} />}
            label="Job match"
            onClick={onJobMatch}
          />
        </span>
        <Divider
          orientation="vertical"
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

export default EditorTopbar;
