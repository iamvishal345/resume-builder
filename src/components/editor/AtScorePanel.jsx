import { useMemo } from "react";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { CheckCircle2, X } from "lucide-react";
import { computeResumeScore } from "@features/ats/score";
import { CheckList } from "./CheckList";
import { useI18n } from "@features/i18n/useI18n";

const ScoreToken = ({ score }) => {
  const color = score >= 90 ? "success" : score >= 70 ? "warning" : "error";
  return (
    <Text type="inherit" size="2xl" weight="bold" color={color}>
      {score}
      <Text type="inherit" size="sm" as="span" color="secondary">
        /100
      </Text>
    </Text>
  );
};

const AtScorePanel = ({ data, onJumpStep, bare = false }) => {
  const { t } = useI18n();
  const { score, checks, passed, total } = useMemo(
    () => computeResumeScore(data),
    [data],
  );

  const items = checks.map((check) => ({
    id: check.id,
    label: check.label,
    hint: !check.ok ? check.hint : null,
    titleColor: check.ok ? "primary" : "secondary",
    action: !check.ok,
    step: check.step,
    icon: check.ok ? (
      <CheckCircle2 size={16} color="var(--color-success)" />
    ) : (
      <X size={16} color="var(--color-error)" />
    ),
  }));

  const body = (
    <VStack gap={3} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            {t("ats.title") || "Resume check"}
          </Text>
          <Text type="inherit" size="md" color="secondary">
            {t("ats.passedTotal", { passed, total }) || `${passed}/${total} complete — updates as you type`}
          </Text>
        </VStack>
        <ScoreToken score={score} />
      </HStack>
      {passed === 0 ? (
        <Text type="inherit" size="sm" color="secondary">
          {t("ats.emptyNote") || "Add your skills, experience and education — the score updates live as you type."}
        </Text>
      ) : null}
      <CheckList
        items={items}
        onFix={(item) => onJumpStep(item.step)}
      />
    </VStack>
  );

  if (bare) return body;

  return (
    <Card padding={4} variant="default">
      {body}
    </Card>
  );
};

export default AtScorePanel;

export { ScoreToken };
