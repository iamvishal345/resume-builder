import React from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Copy, Trash2 } from "lucide-react";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";
import { additionalSectionsOptions } from "./additional/options";
import { catalogKindOf } from "@features/resume/order";

const mintInstanceId = () =>
  Number(
    `${Date.now()}${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
  );

const AdditionalSections = ({ onNext, onPrev, nextLabel }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const setAdditionalSections = useStore(
    (state) => state.setAdditionalSections,
  );
  const duplicateAdditionalSection = useStore(
    (state) => state.duplicateAdditionalSection,
  );
  const removeAdditionalSections = useStore(
    (state) => state.removeAdditionalSections,
  );

  const hasKind = (kind) =>
    additionalSections.some((s) => catalogKindOf(s) === kind);

  const addSection = (option) => {
    const kind = option.id;
    // Custom (1) can be added many times; others once unless duplicated later.
    if (kind !== 1 && hasKind(kind)) return;
    const id = kind === 1 ? mintInstanceId() : kind;
    setAdditionalSections([
      ...additionalSections,
      {
        id,
        kind,
        title: option.title,
        key: `extra-${id}`,
        data: [],
      },
    ]);
  };

  return (
    <StepCard
      title="Add Additional Section"
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <Grid columns={{ minWidth: 480, max: 2 }} gap={3}>
        {additionalSectionsOptions.map((section) => (
          <GridSpan columns={1} key={section.id}>
            <Button
              variant="secondary"
              width="100%"
              icon={<section.icon size={16} />}
              label={
                section.id !== 1 && hasKind(section.id)
                  ? `${section.title} ✓`
                  : section.title
              }
              onClick={() => addSection(section)}
            />
          </GridSpan>
        ))}
      </Grid>
      <VStack gap={3} width="100%">
        {additionalSections.map((section) => {
          const kind = catalogKindOf(section);
          const option = additionalSectionsOptions.find((s) => s.id === kind);
          if (!option) return null;
          const Component = option.component;
          return (
            <VStack key={section.id} gap={2} width="100%">
              <HStack justify="between" align="center" width="100%" gap={2}>
                <Text type="inherit" size="sm" weight="semibold" color="primary">
                  {section.title || option.title}
                </Text>
                <HStack gap={1}>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Copy size={14} />}
                    label="Duplicate"
                    onClick={() => duplicateAdditionalSection(section.id)}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Trash2 size={14} />}
                    label="Remove"
                    onClick={() => removeAdditionalSections({ id: section.id })}
                  />
                </HStack>
              </HStack>
              <Component id={section.id} />
            </VStack>
          );
        })}
      </VStack>
    </StepCard>
  );
};

export default AdditionalSections;
