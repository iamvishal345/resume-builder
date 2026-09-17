import React, { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Card } from "@astryxdesign/core/Card";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextInput } from "@astryxdesign/core/TextInput";
import { TextArea } from "@astryxdesign/core/TextArea";
import {
  Award,
  BadgeCheck,
  Briefcase,
  Heart,
  LayoutGrid,
  Plus,
  Trash2,
  Type,
  Wind,
  Circle,
  Calendar,
  Globe,
  Award as AwardIcon,
} from "lucide-react";
import { Rating } from "@components/Rating";
import { StepCard } from "./StepLayout";
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

  useEffect(() => {
    if (!items || items.length === 0) {
      setSectionData(id, [getCustomSectionObj(), getCustomSectionObj()]);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setSectionData(
      id,
      items.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, { key: Date.now(), title: "", description: "" }]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Custom Section
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Add custom sections with title and description
          </Text>
        </VStack>
        {items?.map((formObj) => (
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={5}>
              <TextInput
                id={formObj.key}
                htmlName="title"
                width="100%"
                label="Title"
                value={formObj.title}
                placeholder="Section Title"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "title", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={7}>
              <TextArea
                id={formObj.key}
                htmlName="description"
                width="100%"
                label="Description"
                value={formObj.description}
                placeholder="Description (supports HTML)"
                rows={3}
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "description", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
          </Grid>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add More"
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
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, { key: Date.now(), title: "", description: "" }]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
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
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={4}>
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
            <GridSpan columns={6}>
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
            <GridSpan columns={2}>
              <HStack align="center" justify="center" width="100%">
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
    if (!items || items.length === 0) {
      setSectionData(id, [getVolunteerObj()]);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setSectionData(
      id,
      items.map((form) => {
        if (form.key === key) {
          if (data.target.type === "checkbox") {
            form[data.target.name] = data.target.checked;
          } else {
            form[data.target.name] = data.target.value;
          }
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, getVolunteerObj()]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
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
        {items?.map((formObj) => (
          <Card key={formObj.key} padding={3} variant="muted">
            <VStack gap={3} width="100%">
              <Grid columns={12} gap={3}>
                <GridSpan columns={4}>
                  <TextInput
                    id={`${formObj.key}-org`}
                    htmlName="organization"
                    width="100%"
                    label="Organization"
                    value={formObj.organization}
                    placeholder="Organization Name"
                    onChange={(value) =>
                      setFieldValue(
                        { target: { name: "organization", value } },
                        formObj.key
                      )
                    }
                  />
                </GridSpan>
                <GridSpan columns={4}>
                  <TextInput
                    id={`${formObj.key}-role`}
                    htmlName="role"
                    width="100%"
                    label="Role"
                    value={formObj.role}
                    placeholder="Your Role"
                    onChange={(value) =>
                      setFieldValue(
                        { target: { name: "role", value } },
                        formObj.key
                      )
                    }
                  />
                </GridSpan>
                <GridSpan columns={4}>
                  <TextInput
                    id={`${formObj.key}-loc`}
                    htmlName="location"
                    width="100%"
                    label="Location"
                    value={formObj.location}
                    placeholder="City, Country"
                    onChange={(value) =>
                      setFieldValue(
                        { target: { name: "location", value } },
                        formObj.key
                      )
                    }
                  />
                </GridSpan>
              </Grid>
              <Grid columns={12} gap={3}>
                <GridSpan columns={3}>
                  <TextInput
                    id={`${formObj.key}-start`}
                    htmlName="startDate"
                    type="month"
                    width="100%"
                    label="Start Date"
                    value={formObj.startDate}
                    onChange={(value) =>
                      setFieldValue(
                        { target: { name: "startDate", value } },
                        formObj.key
                      )
                    }
                  />
                </GridSpan>
                <GridSpan columns={3}>
                  <TextInput
                    id={`${formObj.key}-end`}
                    htmlName="endDate"
                    type="month"
                    width="100%"
                    label="End Date"
                    value={formObj.endDate}
                    onChange={(value) =>
                      setFieldValue(
                        { target: { name: "endDate", value } },
                        formObj.key
                      )
                    }
                  />
                </GridSpan>
                <GridSpan columns={3}>
                  <HStack align="center" gap={2} width="100%">
                    <input
                      type="checkbox"
                      id={`${formObj.key}-current`}
                      checked={formObj.current}
                      onChange={(e) =>
                        setFieldValue(
                          { target: { name: "current", checked: e.target.checked } },
                          formObj.key
                        )
                      }
                    />
                    <label htmlFor={`${formObj.key}-current`} style={{ fontSize: 14 }}>
                      Current
                    </label>
                  </HStack>
                </GridSpan>
                <GridSpan columns={3}>
                  <HStack align="center" justify="center" width="100%">
                    <IconButton
                      label="Remove volunteer role"
                      tooltip="Remove volunteer role"
                      variant="ghost"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleRemove(formObj.key)}
                    />
                  </HStack>
                </GridSpan>
              </Grid>
              <TextArea
                id={`${formObj.key}-desc`}
                htmlName="description"
                width="100%"
                label="Description"
                value={formObj.description}
                placeholder="Description of your role and impact"
                rows={3}
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "description", value } },
                    formObj.key
                  )
                }
              />
            </VStack>
          </Card>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add Volunteer Experience"
            onClick={() => setSectionData(id, [...items, getVolunteerObj()])}
          />
        </HStack>
      </VStack>
    </Card>
  );
};

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
    if (!items || items.length === 0) {
      setSectionData(id, [getCertificationObj(), getCertificationObj()]);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setSectionData(
      id,
      items.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, { key: Date.now(), name: "", issuer: "", date: "", credentialId: "", url: "" }]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
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
        {items?.map((formObj) => (
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={4}>
              <TextInput
                id={`${formObj.key}-name`}
                htmlName="name"
                width="100%"
                label="Certification Name"
                value={formObj.name}
                placeholder="Certification Name"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "name", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={4}>
              <TextInput
                id={`${formObj.key}-issuer`}
                htmlName="issuer"
                width="100%"
                label="Issuing Organization"
                value={formObj.issuer}
                placeholder="e.g., AWS, Google, PMI"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "issuer", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={4}>
              <TextInput
                id={`${formObj.key}-date`}
                htmlName="date"
                type="month"
                width="100%"
                label="Date Earned"
                value={formObj.date}
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "date", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={6}>
              <TextInput
                id={`${formObj.key}-cred`}
                htmlName="credentialId"
                width="100%"
                label="Credential ID"
                value={formObj.credentialId}
                placeholder="Credential ID (optional)"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "credentialId", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={6}>
              <TextInput
                id={`${formObj.key}-url`}
                htmlName="url"
                type="url"
                width="100%"
                label="Credential URL"
                value={formObj.url}
                placeholder="https://verify.example.com/..."
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "url", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
          </Grid>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add Certification"
            onClick={() =>
              setSectionData(id, [
                ...items,
                { key: Date.now(), name: "", issuer: "", date: "", credentialId: "", url: "" },
              ])
            }
          />
        </HStack>
      </VStack>
    </Card>
  );
};

const getLanguageObj = () => ({
  key: crypto.randomUUID(),
  name: "",
  level: 0,
});

const Languages = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const languages = additionalSections.find(
    (section) => section.id === id
  ).data;
  const setLanguages = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (!languages) {
      const initialData = [getLanguageObj(), getLanguageObj()];
      setLanguages(id, initialData);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setLanguages(
      id,
      languages.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMoreLanguages = () => {
    setLanguages(id, [...languages, { key: Date.now(), name: "", level: 0 }]);
  };

  const handleRemoveLanguage = (key) => {
    setLanguages(
      id,
      languages.filter((language) => language.key !== key)
    );
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Languages
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Show experience level
          </Text>
        </VStack>
        {languages?.map((formObj) => (
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={5}>
              <TextInput
                id={formObj.key}
                htmlName="name"
                width="100%"
                label="Skill Name"
                value={formObj.name}
                placeholder="Skill Name"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "name", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={5}>
              <HStack align="center" width="100%">
                <Rating
                  value={formObj.level}
                  onValueChange={(value) =>
                    setFieldValue(
                      { target: { name: "level", value } },
                      formObj.key
                    )
                  }
                  type="success"
                  icon={Circle}
                />
              </HStack>
            </GridSpan>
            <GridSpan columns={2}>
              <HStack align="center" justify="center" width="100%">
                <IconButton
                  label="Remove language"
                  tooltip="Remove language"
                  variant="ghost"
                  icon={<Trash2 size={16} />}
                  onClick={() => handleRemoveLanguage(formObj.key)}
                />
              </HStack>
            </GridSpan>
          </Grid>
        ))}
        <HStack>
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            label="Add More Languages"
            onClick={handleAddMoreLanguages}
          />
        </HStack>
      </VStack>
    </Card>
  );
};

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
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, getReferenceObj()]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
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
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={4}>
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
            <GridSpan columns={4}>
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
            <GridSpan columns={4}>
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
            <GridSpan columns={4}>
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
            <GridSpan columns={6}>
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
            <GridSpan columns={2}>
              <HStack align="center" justify="center" width="100%">
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

const getInterestObj = () => ({
  key: crypto.randomUUID(),
  name: "",
});

const Interests = ({ id }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const section = additionalSections.find((s) => s.id === id);
  const items = section?.data || [];
  const setSectionData = useStore((state) => state.setAdditionalSectionData);

  useEffect(() => {
    if (!items || items.length === 0) {
      setSectionData(id, [getInterestObj(), getInterestObj()]);
    }
  }, []);

  const setFieldValue = (data, key) => {
    setSectionData(
      id,
      items.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMore = () => {
    setSectionData(id, [...items, getInterestObj()]);
  };

  const handleRemove = (key) => {
    setSectionData(id, items.filter((item) => item.key !== key));
  };

  return (
    <Card padding={4} variant="default">
      <VStack gap={3} width="100%">
        <VStack gap={1} width="100%">
          <Text type="inherit" size="xl" weight="semibold" color="primary">
            Interests
          </Text>
          <Text type="inherit" size="md" color="secondary">
            Personal interests and hobbies worth highlighting
          </Text>
        </VStack>
        {items?.map((formObj) => (
          <Grid columns={12} gap={3} key={formObj.key}>
            <GridSpan columns={10}>
              <TextInput
                id={`${formObj.key}-name`}
                htmlName="name"
                width="100%"
                label="Interest"
                value={formObj.name}
                placeholder="e.g., Open Source, Trail Running"
                onChange={(value) =>
                  setFieldValue(
                    { target: { name: "name", value } },
                    formObj.key
                  )
                }
              />
            </GridSpan>
            <GridSpan columns={2}>
              <HStack align="center" justify="center" width="100%">
                <IconButton
                  label="Remove interest"
                  tooltip="Remove interest"
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
            label="Add More Interests"
            onClick={handleAddMore}
          />
        </HStack>
      </VStack>
    </Card>
  );
};

const additionalSectionsOptions = [
  {
    id: 1,
    title: "Custom Section",
    component: CustomSection,
    icon: LayoutGrid,
  },
  {
    id: 2,
    title: "Accomplishments",
    component: Accomplishments,
    icon: Award,
  },
  {
    id: 3,
    title: "Volunteer Experience",
    component: VolunteerExperience,
    icon: Wind,
  },
  {
    id: 4,
    title: "Certifications",
    component: Certifications,
    icon: BadgeCheck,
  },
  {
    id: 5,
    title: "Languages",
    component: Languages,
    icon: Type,
  },
  {
    id: 6,
    title: "References",
    component: References,
    icon: Briefcase,
  },
  {
    id: 7,
    title: "Interests",
    component: Interests,
    icon: Heart,
  },
];

const AdditionalSections = ({ onNext }) => {
  const additionalSections = useStore((state) => state.additionalSections);
  const setAdditionalSections = useStore(
    (state) => state.setAdditionalSections
  );
  return (
    <StepCard title="Add Additional Section" onNext={onNext}>
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
                  setAdditionalSections([...additionalSections, section]);
                }
              }}
            />
          </GridSpan>
        ))}
      </Grid>
      <VStack gap={3} width="100%">
        {additionalSections.map((section) => {
          const Component = additionalSectionsOptions.find(
            (s) => s.id === section.id
          ).component;
          return <Component key={section.id} id={section.id} />;
        })}
      </VStack>
    </StepCard>
  );
};

export default AdditionalSections;