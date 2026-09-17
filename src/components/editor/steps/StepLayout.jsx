import React from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";

export const NextButton = ({ onClick, label = "Next" }) => (
  <HStack justify="end" width="100%">
    <Button
      variant="primary"
      size="md"
      label={label}
      endContent={<Icon icon="chevronRight" />}
      onClick={onClick}
    />
  </HStack>
);

export const StepCard = ({
  title,
  description,
  children,
}) => (
  <VStack gap={4} width="100%">
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="2xl" weight="semibold" color="primary">
            {title}
          </Text>
          {description && (
            <Text type="inherit" size="md" color="secondary">
              {description}
            </Text>
          )}
        </VStack>
        {children}
      </VStack>
    </Card>
  </VStack>
);