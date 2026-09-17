import React, { useMemo } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";
import { computeCoherenceIssues } from "@features/coherence/lint";

const CoherencePanel = ({ data, onJumpStep, bare = false }) => {
  const { issues } = useMemo(() => computeCoherenceIssues(data), [data]);

  // cap the list so a noisy timeline doesn't overflow the drawer
  const visible = issues.slice(0, 12);
  const hidden = issues.length - visible.length;

  const body = (
    <VStack gap={3} width="100%">
      <HStack justify="between" align="center" width="100%">
        <VStack gap={0}>
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Coherence
          </Text>
          <Text type="inherit" size="md" color="secondary">
            {issues.length === 0
              ? "No internal contradictions found"
              : `${issues.length} issue${issues.length === 1 ? "" : "s"} to review`}
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
        <HStack gap={2} align="center">
          <Text type="inherit" size="sm" color="secondary">
            Overlapping dates, duplicated contacts, and summary-vs-skills
            mismatches are checked automatically.
          </Text>
        </HStack>
      ) : (
        <VStack gap={1} width="100%">
          {visible.map((id) => (
            <HStack
              key={id.id}
              justify="between"
              align="center"
              gap={3}
              width="100%"
              padding={1}
            >
              <HStack gap={2} align="start">
                <AlertTriangle
                  size={16}
                  color={
                    id.severity === "error"
                      ? "var(--color-error)"
                      : "var(--color-warning)"
                  }
                />
                <VStack gap={0}>
                  <Text
                    type="inherit"
                    size="md"
                    weight="medium"
                    color={id.severity === "error" ? "accent" : "primary"}
                  >
                    {id.label}
                  </Text>
                  {id.hint ? (
                    <Text type="inherit" size="sm" color="secondary">
                      {id.hint}
                    </Text>
                  ) : null}
                </VStack>
              </HStack>
              <Button
                size="sm"
                variant="ghost"
                icon={<Check size={13} />}
                label="Fix"
                onClick={() => onJumpStep(id.step)}
              />
            </HStack>
          ))}
          {hidden > 0 ? (
            <Text type="inherit" size="sm" color="secondary">
              +{hidden} more — review your roles and dates.
            </Text>
          ) : null}
        </VStack>
      )}
    </VStack>
  );

  if (bare) return body;

  return (
    <div style={{ paddingTop: "var(--spacing-2)" }}>{body}</div>
  );
};

export default CoherencePanel;