import { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@store";
import "./entry-list.css";

const getCertificationObj = () => ({
  key: crypto.randomUUID(),
  name: "",
  issuer: "",
  date: "",
  credentialId: "",
  url: "",
});

const Certifications = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (items.length) return;
    setSectionData(id, [getCertificationObj(), getCertificationObj()]);
  }, []);

  const setField = (key, name, value) => {
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
            Certifications
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Add professional certifications and licenses
          </Text>
        </VStack>
        <div className="entry-list">
          {items.map((formObj) => (
            <div className="entry-list-item" key={formObj.key}>
              <div className="entry-list-item-head">
                <Text type="inherit" size="sm" weight="medium" color="secondary">
                  Certification
                </Text>
                <IconButton
                  label="Remove certification"
                  tooltip="Remove certification"
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 size={16} />}
                  onClick={() =>
                    setSectionData(
                      id,
                      items.filter((item) => item.key !== formObj.key),
                    )
                  }
                />
              </div>
              <div className="entry-list-fields">
                <TextInput
                  id={`${formObj.key}-name`}
                  htmlName="name"
                  width="100%"
                  label="Certification name"
                  value={formObj.name}
                  placeholder="Certification name"
                  onChange={(value) => setField(formObj.key, "name", value)}
                />
                <TextInput
                  id={`${formObj.key}-issuer`}
                  htmlName="issuer"
                  width="100%"
                  label="Issuing organization"
                  value={formObj.issuer}
                  placeholder="e.g. AWS, Google, PMI"
                  onChange={(value) => setField(formObj.key, "issuer", value)}
                />
                <TextInput
                  id={`${formObj.key}-date`}
                  htmlName="date"
                  type="month"
                  width="100%"
                  label="Date earned"
                  value={formObj.date}
                  onChange={(value) => setField(formObj.key, "date", value)}
                />
              </div>
              <div className="entry-list-fields entry-list-fields-2">
                <TextInput
                  id={`${formObj.key}-cred`}
                  htmlName="credentialId"
                  width="100%"
                  label="Credential ID"
                  value={formObj.credentialId}
                  placeholder="Optional"
                  onChange={(value) =>
                    setField(formObj.key, "credentialId", value)
                  }
                />
                <TextInput
                  id={`${formObj.key}-url`}
                  htmlName="url"
                  type="url"
                  width="100%"
                  label="Credential URL"
                  value={formObj.url}
                  placeholder="https://verify.example.com/..."
                  onChange={(value) => setField(formObj.key, "url", value)}
                />
              </div>
            </div>
          ))}
        </div>
        <HStack>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={16} />}
            label="Add certification"
            onClick={() =>
              setSectionData(id, [...items, getCertificationObj()])
            }
          />
        </HStack>
      </VStack>
    </Card>
  );
};

export default Certifications;
