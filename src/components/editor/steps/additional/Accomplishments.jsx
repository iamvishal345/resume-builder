import React, { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@store";

const getAccomplishmentObj = () => ({
  key: crypto.randomUUID(),
  title: "",
  description: "",
});

const Accomplishments = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSectionData(id, [getAccomplishmentObj(), getAccomplishmentObj()]);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setSectionData(
      id,
      items.map((form) => {
        if (form.key !== key) return form;
        return { ...form, [data.target.name]: data.target.value };
      })
    );
  };

  const handleRemove = (key) => {
    setSectionData(
      id,
      items.filter((item) => item.key !== key)
    );
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Accomplishments
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Highlight key achievements and awards
          </Text>
        </VStack>
        {items?.map((formObj) => (
          <Grid
            columns={{ minWidth: 200, max: 3 }}
            gap={3}
            width="100%"
            key={formObj.key}
          >
            <GridSpan columns={1}>
              <TextInput
                id={formObj.key}
                htmlName="title"
                width="100%"
                label="Title"
                value={formObj.title}
                placeholder="Accomplishment Title"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "title", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextArea
                id={formObj.key}
                htmlName="description"
                width="100%"
                label="Description"
                value={formObj.description}
                placeholder="Details"
                rows={3}
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "description", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <HStack align="center" justify="start" width="100%">
                <IconButton
                  label="Remove accomplishment"
                  tooltip="Remove accomplishment"
                  variant="ghost"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemove(formObj.key)}
                />
              </HStack>
            </GridSpan>
          </Grid>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add Accomplishment"
            onClick={() =>
              setSectionData(id, [
                ...items,
                { key: Date.now(), title: "", description: "" },
              ])
            }
          />
        </HStack>
      </VStack>
    </Card>
  );
};

export default Accomplishments;
