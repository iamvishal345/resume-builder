import React from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { VStack } from "@astryxdesign/core/Layout";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";
import { additionalSectionsOptions } from "./additional/options";

const AdditionalSections = ({ onNext, onPrev, nextLabel }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const setAdditionalSections = useStore(
    (state) => state.setAdditionalSections
  );

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
              label={section.title}
              onClick={() => {
                if (!additionalSections.find((s) => s.id === section.id)) {
                  setAdditionalSections([
                    ...additionalSections,
                    { id: section.id, title: section.title, data: [] },
                  ]);
                }
              }}
            />
          </GridSpan>
        ))}
      </Grid>
      <VStack gap={3} width="100%">
        {additionalSections.map((section) => {
          const option = additionalSectionsOptions.find(
            (s) => s.id === section.id
          );
          if (!option) return null;
          const Component = option.component;
          return <Component key={section.id} id={section.id} />;
        })}
      </VStack>
    </StepCard>
  );
};

export default AdditionalSections;
