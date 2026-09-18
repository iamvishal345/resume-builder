import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Check } from "lucide-react";

/**
 * Shared checklist row used by Resume check (ATS) and Coherence panels.
 * `icon` is a React node (status glyph); `action` shows a Fix button when set.
 */
export const CheckList = ({ items, onFix, empty, footer }) => (
  <VStack gap={1} width="100%">
    {items.length === 0 && empty ? empty : null}
    {items.map((item) => (
      <HStack
        key={item.id}
        justify="between"
        align="center"
        gap={3}
        width="100%"
        padding={1}
      >
        <HStack gap={2} align="start">
          {item.icon}
          <VStack gap={0}>
            <Text
              type="inherit"
              size="md"
              weight="medium"
              color={item.titleColor || "primary"}
            >
              {item.label}
            </Text>
            {item.hint ? (
              <Text type="inherit" size="sm" color="secondary">
                {item.hint}
              </Text>
            ) : null}
          </VStack>
        </HStack>
        {item.action && onFix ? (
          <Button
            size="sm"
            variant="ghost"
            icon={<Check size={13} />}
            label="Fix"
            onClick={() => onFix(item)}
          />
        ) : null}
      </HStack>
    ))}
    {footer}
  </VStack>
);

export default CheckList;
