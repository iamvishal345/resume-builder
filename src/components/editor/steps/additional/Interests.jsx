import { useEffect } from "react";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { RatedNameList } from "../RatedNameList";
import { useStore } from "@store";
import { normalizeSkill } from "@features/resume/skillList";

const getInterestObj = () => normalizeSkill({});

const Interests = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);
  const patchSection = useStore((state) => state.patchAdditionalSection);
  const showLevel = section?.showLevel === true;

  useEffect(() => {
    if (items.length) return;
    setSectionData(id, [getInterestObj(), getInterestObj()]);
  }, []);

  const setShowLevel = (next) => {
    patchSection(id, { showLevel: next });
    if (!next) {
      setSectionData(
        id,
        items.map((item) => ({ ...normalizeSkill(item), level: 0 })),
      );
    }
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Interests
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Personal interests and hobbies — drag to reorder. Level is optional.
          </Text>
        </VStack>
        <RatedNameList
          items={items.map((item) => normalizeSkill(item))}
          onItemsChange={(next) => setSectionData(id, next)}
          createItem={getInterestObj}
          nameLabel="Interest"
          namePlaceholder="e.g. Open Source, Trail Running"
          addLabel="Add interest"
          showLevel={showLevel}
          levelConfigurable
          onShowLevelChange={setShowLevel}
        />
      </VStack>
    </Card>
  );
};

export default Interests;
