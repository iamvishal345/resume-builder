import { useEffect } from "react";
import { Card } from "@astryxdesign/core/Card";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { RatedNameList } from "../RatedNameList";
import { useStore } from "@store";
import { normalizeSkill } from "@features/resume/skillList";

const getLanguageObj = () => normalizeSkill({});

const Languages = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const languages = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);
  const patchSection = useStore((state) => state.patchAdditionalSection);
  const showLevel = section?.showLevel !== false;

  useEffect(() => {
    if (languages.length) return;
    setSectionData(id, [getLanguageObj(), getLanguageObj()]);
  }, []);

  const setShowLevel = (next) => {
    patchSection(id, { showLevel: next });
    if (!next) {
      setSectionData(
        id,
        languages.map((item) => ({ ...normalizeSkill(item), level: 0 })),
      );
    }
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Languages
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Drag to reorder. Level is optional.
          </Text>
        </VStack>
        <RatedNameList
          items={languages.map((item) => normalizeSkill(item))}
          onItemsChange={(next) => setSectionData(id, next)}
          createItem={getLanguageObj}
          nameLabel="Language"
          namePlaceholder="e.g. English"
          addLabel="Add language"
          showLevel={showLevel}
          levelConfigurable
          onShowLevelChange={setShowLevel}
        />
      </VStack>
    </Card>
  );
};

export default Languages;
