import React, { useMemo } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Check, X, CheckCircle2 } from "lucide-react";
import { computeResumeScore } from "@features/ats/score";

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
  const { score, checks, passed, total } = useMemo(
    () => computeResumeScore(data),
    [data]
  );

  const body = (
    <VStack gap={3} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Resume check
          </Text>
          <Text type="inherit" size="md" color="secondary">
            {passed}/{total} complete — updates as you type
          </Text>
        </VStack>
        <ScoreToken score={score} />
      </HStack>
      <VStack gap={1} width="100%">
          {checks.map((check) => (
            <HStack
              key={check.id}
              justify="between"
              align="center"
              gap={3}
              width="100%"
              padding={1}
            >
              <HStack gap={2} align="start">
                {check.ok ? (
                  <CheckCircle2 size={16} color="var(--color-success)" />
                ) : (
                  <X size={16} color="var(--color-error)" />
                )}
                <VStack gap={0}>
                  <Text
                    type="inherit"
                    size="md"
                    weight="medium"
                    color={check.ok ? "primary" : "secondary"}
                  >
                    {check.label}
                  </Text>
                  {!check.ok && check.hint ? (
                    <Text type="inherit" size="sm" color="secondary">
                      {check.hint}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
              {!check.ok ? (
                <Button
                  size="sm"
                  variant="ghost"
                  icon={<Check size={13} />}
                  label="Fix"
                  onClick={() => onJumpStep(check.step)}
                />
              ) : null}
            </HStack>
          ))}
        </VStack>
      </VStack>
  );

  if (bare) return body;

  return <Card padding={4} variant="default">{body}</Card>;
};

export default AtScorePanel;
export { ScoreToken };