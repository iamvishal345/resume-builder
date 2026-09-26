import { useMemo } from "react";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { computeCoherenceIssues } from "@features/coherence/lint";
import { useI18n } from "@features/i18n/useI18n";
import { CheckList } from "./CheckList";

const CoherencePanel = ({ data, onJumpStep, bare = false }) => {
  const { t } = useI18n();
  const { issues } = useMemo(() => computeCoherenceIssues(data), [data]);

  const visible = issues.slice(0, 12);
  const hidden = issues.length - visible.length;

  const items = visible.map((issue) => ({
    id: issue.id,
    label: issue.label,
    hint: issue.hint || null,
    titleColor: issue.severity === "error" ? "accent" : "primary",
    action: true,
    step: issue.step,
    icon: (
      <AlertTriangle
        size={16}
        color={
          issue.severity === "error"
            ? "var(--color-error)"
            : "var(--color-warning)"
        }
      />
    ),
  }));

  const body = (
    <VStack gap={3} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            {t("coherence.title")}
          </Text>
          <Text type="inherit" size="md" color="secondary">
            {issues.length === 0
              ? t("coherence.noIssues")
              : t("coherence.issuesFound", { count: issues.length })}
          </Text>
        </VStack>
        {issues.length === 0 ? (
          <ShieldCheck size={20} color="var(--color-success)" />
        ) : (
          <Text type="inherit" size="2xl" weight="bold" color="warning">
            {issues.length}
          </Text>
        )}
      </HStack>
      {issues.length === 0 ? (
        <Text type="inherit" size="sm" color="secondary">
          {t("coherence.cleanNote")}
        </Text>
      ) : (
        <CheckList
          items={items}
          onFix={(item) => onJumpStep(item.step)}
          footer={
            hidden > 0 ? (
              <Text type="inherit" size="sm" color="secondary">
                {t("coherence.moreIssues", { count: hidden })}
              </Text>
            ) : null
          }
        />
      )}
    </VStack>
  );

  if (bare) return body;

  return <div style={{ paddingTop: "var(--spacing-2)" }}>{body}</div>;
};

export default CoherencePanel;
