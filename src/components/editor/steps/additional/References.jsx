import React, { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@store";

const getReferenceObj = () => ({
  key: crypto.randomUUID(),
  name: "",
  role: "",
  organization: "",
  phone: "",
  email: "",
});

const References = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSectionData(id, [getReferenceObj()]);
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

  const handleAddMore = () => {
    setSectionData(id, [...items, getReferenceObj()]);
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
            References
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Provide professional references and their contact info
          </Text>
        </VStack>
        {items?.map((formObj) => (
          <Grid
            columns={{ minWidth: 200, max: 2 }}
            gap={3}
            width="100%"
            key={formObj.key}
          >
            <GridSpan columns={1}>
              <TextInput
                id={`${formObj.key}-name`}
                htmlName="name"
                width="100%"
                label="Full Name"
                value={formObj.name}
                placeholder="Reference Name"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "name", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextInput
                id={`${formObj.key}-role`}
                htmlName="role"
                width="100%"
                label="Job Title"
                value={formObj.role}
                placeholder="e.g., Engineering Manager"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "role", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextInput
                id={`${formObj.key}-organization`}
                htmlName="organization"
                width="100%"
                label="Company"
                value={formObj.organization}
                placeholder="Company Name"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "organization", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextInput
                id={`${formObj.key}-phone`}
                htmlName="phone"
                width="100%"
                label="Phone"
                value={formObj.phone}
                placeholder="+1 555 000 0000"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "phone", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <TextInput
                id={`${formObj.key}-email`}
                htmlName="email"
                width="100%"
                label="Email"
                value={formObj.email}
                placeholder="name@example.com"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "email", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={1}>
              <HStack align="center" justify="start" width="100%">
                <IconButton
                  label="Remove reference"
                  tooltip="Remove reference"
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
            label="Add More References"
            onClick={handleAddMore}
          />
        </HStack>
      </VStack>
    </Card>
  );
};

export default References;
