import { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Plus } from "lucide-react";
import { useStore } from "@store";

const getCustomSectionObj = () => ({
  key: crypto.randomUUID(),
  title: "",
  description: "",
});

const CustomSection = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);
  const setSectionTitle = useStore((state) => state.setAdditionalSectionTitle);

  useEffect(() => {
    if (items.length) return;
    setSectionData(id, [getCustomSectionObj(), getCustomSectionObj()]);
  }, []);

  const setFieldValue = (name, value, key) => {
    setSectionData(
      id,
      items.map((form) =>
        form.key === key ? { ...form, [name]: value } : form,
      ),
    );
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Custom Section
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Name the section (shown on the resume & PDF), then add entries.
          </Text>
        </VStack>
        <TextInput
          id={`section-title-${id}`}
          htmlName="sectionTitle"
          width="100%"
          label="Section title"
          value={section?.title || ""}
          placeholder="e.g. Projects, Publications, Open Source"
          onChange={(value) => setSectionTitle(id, value)}
        />
        {items.map((formObj) => (
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={5}>
              <TextInput
                id={formObj.key}
                htmlName="title"
                width="100%"
                label="Entry title"
                value={formObj.title}
                placeholder="Entry title"
                onChange={(value) => setFieldValue("title", value, formObj.key)}
              />
            </GridSpan>
            <GridSpan columns={7}>
              <TextArea
                id={`${formObj.key}-desc`}
                htmlName="description"
                width="100%"
                label="Description"
                value={formObj.description}
                placeholder="Description (supports HTML)"
                rows={3}
                onChange={(value) =>
                  setFieldValue("description", value, formObj.key)
                }
              />
            </GridSpan>
          </Grid>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add entry"
            onClick={() =>
              setSectionData(id, [...items, getCustomSectionObj()])
            }
          />
        </HStack>
      </VStack>
    </Card>
  );
};

export default CustomSection;
