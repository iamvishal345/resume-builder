import { HStack } from "@astryxdesign/core/Layout";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Divider } from "@astryxdesign/core/Divider";
import { ListItem } from "@astryxdesign/core/List";
import {
  Eye,
  Pencil,
  Copy,
  Trash2,
  LayoutTemplate,
  Palette,
  Mail,
  Sparkles,
  FileDown,
  FileText,
  Download,
  Briefcase,
} from "lucide-react";
import { exportResumeJson } from "@features/resumes/backup";
import { nameOf } from "./resumeMeta";

const ResumeListItem = ({
  doc,
  description,
  onPreview,
  onDownloadPdf,
  onCoverLetter,
  onInterviewPacket,
  onChangeTemplate,
  onChangeTheme,
  onDuplicate,
  onTailor,
  onDelete,
}) => (
  <ListItem
    label={nameOf(doc)}
    description={description}
    startContent={
      <span className="rdash-file">
        <FileText size={18} />
      </span>
    }
    endContent={
      <div className="rdash-item-actions">
        <IconButton
          variant="ghost"
          size="sm"
          label="Preview resume"
          tooltip="Preview resume"
          icon={<Eye size={16} />}
          onClick={() => onPreview(doc)}
        />
        <IconButton
          variant="ghost"
          size="sm"
          label="Edit resume"
          tooltip="Edit resume"
          icon={<Pencil size={16} />}
          onClick={() => {
            window.location.href = `/editor?resume=${doc.id}`;
          }}
        />
        <IconButton
          variant="ghost"
          size="sm"
          label="Download PDF"
          tooltip="Download PDF"
          icon={<FileDown size={16} />}
          onClick={() => onDownloadPdf(doc)}
        />
        <span className="rdash-item-actions-secondary">
          <IconButton
            variant="ghost"
            size="sm"
            label="Backup JSON"
            tooltip="Download this resume as a JSON backup"
            icon={<Download size={16} />}
            onClick={() => exportResumeJson(doc)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Cover letter"
            tooltip="Cover letter"
            icon={<Mail size={16} />}
            onClick={() => onCoverLetter(doc)}
          />
          <Divider
            orientation="vertical"
            style={{ height: "var(--spacing-4)" }}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Change template"
            tooltip="Change template"
            icon={<LayoutTemplate size={16} />}
            onClick={() => onChangeTemplate(doc)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Change theme"
            tooltip="Change theme"
            icon={<Palette size={16} />}
            onClick={() => onChangeTheme(doc)}
          />
          <Divider
            orientation="vertical"
            style={{ height: "var(--spacing-4)" }}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Duplicate"
            tooltip="Duplicate"
            icon={<Copy size={16} />}
            onClick={() => onDuplicate(doc)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Tailor for a job (AI)"
            tooltip="Tailor for a job (AI)"
            icon={<Sparkles size={16} />}
            onClick={() => onTailor(doc)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label="Interview packet"
            tooltip="Interview packet"
            icon={<Briefcase size={16} />}
            onClick={() => onInterviewPacket?.(doc)}
          />
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          label="Delete"
          tooltip="Delete"
          icon={<Trash2 size={16} />}
          onClick={() => onDelete(doc)}
        />
      </div>
    }
  />
);

export default ResumeListItem;
