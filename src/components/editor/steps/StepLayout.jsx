import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Icon } from "@astryxdesign/core/Icon";

export const StepCard = ({
  title,
  description,
  children,
  onNext,
  onPrev,
  nextLabel = "Next",
  showNav = true,
}) => (
  <VStack gap={4} width="100%">
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            {title}
          </Text>
          {description && (
            <Text type="inherit" size="sm" color="secondary">
              {description}
            </Text>
          )}
        </VStack>
        {children}
        {showNav && (onNext || onPrev) ? (
          <HStack justify="between" align="center" width="100%" gap={3}>
            {onPrev ? (
              <Button
                variant="ghost"
                size="sm"
                label="Back"
                icon={<Icon icon="chevronLeft" />}
                onClick={onPrev}
              />
            ) : (
              <span />
            )}
            {onNext ? (
              <Button
                variant="primary"
                size="sm"
                label={nextLabel}
                endContent={<Icon icon="chevronRight" />}
                onClick={onNext}
              />
            ) : null}
          </HStack>
        ) : null}
      </VStack>
    </Card>
  </VStack>
);
