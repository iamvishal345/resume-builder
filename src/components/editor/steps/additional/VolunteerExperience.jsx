import { useEffect } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Plus, Trash2 } from "lucide-react";
import { useStore } from "@store";
import "./entry-list.css";

const getVolunteerObj = () => ({
  key: crypto.randomUUID(),
  organization: "",
  role: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  description: "",
});

const VolunteerExperience = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (items.length) return;
    setSectionData(id, [getVolunteerObj()]);
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
            Volunteer Experience
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Add volunteer roles and community involvement
          </Text>
        </VStack>
        <div className="entry-list">
          {items.map((formObj) => (
            <div className="entry-list-item" key={formObj.key}>
              <div className="entry-list-item-head">
                <Text type="inherit" size="sm" weight="medium" color="secondary">
                  Role
                </Text>
                <IconButton
                  label="Remove volunteer role"
                  tooltip="Remove volunteer role"
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
                  id={`${formObj.key}-org`}
                  htmlName="organization"
                  width="100%"
                  label="Organization"
                  value={formObj.organization}
                  placeholder="Organization Name"
                  onChange={(value) =>
                    setField(formObj.key, "organization", value)
                  }
                />
                <TextInput
                  id={`${formObj.key}-role`}
                  htmlName="role"
                  width="100%"
                  label="Role"
                  value={formObj.role}
                  placeholder="Your Role"
                  onChange={(value) => setField(formObj.key, "role", value)}
                />
                <TextInput
                  id={`${formObj.key}-loc`}
                  htmlName="location"
                  width="100%"
                  label="Location"
                  value={formObj.location}
                  placeholder="City, Country"
                  onChange={(value) =>
                    setField(formObj.key, "location", value)
                  }
                />
              </div>
              <div className="entry-list-fields entry-list-fields-4">
                <TextInput
                  id={`${formObj.key}-start`}
                  htmlName="startDate"
                  type="month"
                  width="100%"
                  label="Start Date"
                  value={formObj.startDate}
                  onChange={(value) =>
                    setField(formObj.key, "startDate", value)
                  }
                />
                <TextInput
                  id={`${formObj.key}-end`}
                  htmlName="endDate"
                  type="month"
                  width="100%"
                  label="End Date"
                  value={formObj.endDate}
                  isDisabled={!!formObj.current}
                  onChange={(value) => setField(formObj.key, "endDate", value)}
                />
                <label className="entry-list-check">
                  <input
                    type="checkbox"
                    checked={!!formObj.current}
                    onChange={(e) =>
                      setField(formObj.key, "current", e.target.checked)
                    }
                  />
                  Current
                </label>
              </div>
              <TextArea
                id={`${formObj.key}-desc`}
                htmlName="description"
                width="100%"
                label="Description"
                value={formObj.description}
                placeholder="Description of your role and impact"
                rows={3}
                onChange={(value) =>
                  setField(formObj.key, "description", value)
                }
              />
            </div>
          ))}
        </div>
        <HStack>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={16} />}
            label="Add volunteer role"
            onClick={() => setSectionData(id, [...items, getVolunteerObj()])}
          />
        </HStack>
      </VStack>
    </Card>
  );
};

export default VolunteerExperience;
