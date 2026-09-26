import { HStack } from "@astryxdesign/core/Layout";
import { IconButton } from "@astryxdesign/core/IconButton";
import { DropdownMenu } from "@astryxdesign/core/DropdownMenu";
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
  MoreVertical,
} from "lucide-react";
import { exportResumeJson } from "@features/resumes/backup";
import { nameOf } from "./resumeMeta";
import { useI18n } from "@features/i18n/useI18n";

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
}) => {
  const { t } = useI18n();
  const menuItems = [
    {
      label: t("dash.itemCoverLetter") || "Cover letter",
      icon: <Mail size={16} />,
      onClick: () => onCoverLetter(doc),
    },
    {
      label: t("dash.itemTailor") || "Tailor for a job (AI)",
      icon: <Sparkles size={16} />,
      onClick: () => onTailor(doc),
    },
    {
      label: t("dash.itemPacket") || "Interview packet",
      icon: <Briefcase size={16} />,
      onClick: () => onInterviewPacket?.(doc),
    },
    { type: "divider" },
    {
      label: t("dash.itemTemplate") || "Change template",
      icon: <LayoutTemplate size={16} />,
      onClick: () => onChangeTemplate(doc),
    },
    {
      label: t("dash.itemTheme") || "Change theme",
      icon: <Palette size={16} />,
      onClick: () => onChangeTheme(doc),
    },
    { type: "divider" },
    {
      label: t("dash.itemDuplicate") || "Duplicate",
      icon: <Copy size={16} />,
      onClick: () => onDuplicate(doc),
    },
    {
      label: t("dash.itemBackupJson") || "Backup JSON",
      icon: <Download size={16} />,
      onClick: () => exportResumeJson(doc),
    },
    { type: "divider" },
    {
      label: t("dash.itemDelete") || "Delete",
      icon: <Trash2 size={16} />,
      variant: "destructive",
      onClick: () => onDelete(doc),
    },
  ];

  return (
    <ListItem
      label={nameOf(doc)}
      description={description}
      startContent={
        <span className="rdash-file">
          <FileText size={18} />
        </span>
      }
      endContent={
        <HStack gap={1} align="center">
          <IconButton
            variant="ghost"
            size="sm"
            label={t("dash.itemPreview") || "Preview resume"}
            tooltip={t("dash.itemPreview") || "Preview resume"}
            icon={<Eye size={16} />}
            onClick={() => onPreview(doc)}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label={t("dash.itemEdit") || "Edit resume"}
            tooltip={t("dash.itemEdit") || "Edit resume"}
            icon={<Pencil size={16} />}
            onClick={() => {
              window.location.href = `/editor?resume=${doc.id}`;
            }}
          />
          <IconButton
            variant="ghost"
            size="sm"
            label={t("dash.itemDownloadPdf") || "Download PDF"}
            tooltip={t("dash.itemDownloadPdf") || "Download PDF"}
            icon={<FileDown size={16} />}
            onClick={() => onDownloadPdf(doc)}
          />
          <DropdownMenu
            button={{
              variant: "ghost",
              size: "sm",
              icon: <MoreVertical size={16} />,
              label: t("dash.itemMoreOptions") || "More options",
            }}
            hasChevron={false}
            items={menuItems}
          />
        </HStack>
      }
    />
  );
};

export default ResumeListItem;
