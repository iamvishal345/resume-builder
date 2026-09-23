import { useMemo } from "react";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { BookOpen } from "lucide-react";
import {
  analyzeReadingLevel,
  formatReadingHint,
} from "@features/ats/readingLevel";
import { stripHtmlFlat } from "@lib/text";

const ReadingLevelPanel = ({ data, bare = false }) => {
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
      ? "Add a summary or experience bullets to estimate reading level."
      : analysis.grade > 12
        ? "A bit dense for scanners — shorten sentences where you can."
        : analysis.grade < 7
          ? "Very plain — fine for clarity; add specifics if it feels thin."
          : "Aim for Clear / Standard so recruiters can skim quickly.";

  const body = (
    <VStack gap={2} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Reading level
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
