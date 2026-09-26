import { useMemo } from "react";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { BookOpen } from "lucide-react";
import {
  analyzeReadingLevel,
  formatReadingHint,
} from "@features/ats/readingLevel";
import { stripHtmlFlat } from "@lib/text";
import { useI18n } from "@features/i18n/useI18n";

const ReadingLevelPanel = ({ data, bare = false }) => {
  const { t } = useI18n();
  const analysis = useMemo(() => {
    const parts = [
      stripHtmlFlat(data?.summary || ""),
      ...(data?.experience || []).map((role) =>
        [
          role.positionTitle,
          role.companyName,
          stripHtmlFlat(role.workSummary || ""),
        ]
          .filter(Boolean)
          .join(". "),
      ),
    ].filter(Boolean);
    return analyzeReadingLevel(parts.join(" "));
  }, [data?.summary, data?.experience]);

  const tip =
    analysis.grade == null
      ? t("reading.empty")
      : analysis.grade > 12
        ? t("reading.dense")
        : analysis.grade < 7
          ? t("reading.plain")
          : t("reading.standard");

  const body = (
    <VStack gap={2} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            {t("reading.title")}
          </Text>
          <Text type="inherit" size="md" color="secondary">
            {formatReadingHint(analysis) || "—"}
          </Text>
        </VStack>
        <BookOpen size={20} color="var(--color-secondary)" />
      </HStack>
      <Text type="inherit" size="sm" color="secondary">
        {tip}
      </Text>
    </VStack>
  );

  if (bare) return body;
  return <div style={{ paddingTop: "var(--spacing-2)" }}>{body}</div>;
};

export default ReadingLevelPanel;
