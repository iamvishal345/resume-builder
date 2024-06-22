import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Grid,
  Input,
  Spacer,
  Text,
  Toggle,
} from "@geist-ui/core";
import {
  ArrowRight,
  Briefcase,
  Plus,
  Trash,
  Heart,
  Grid as GridIcon,
  Award,
  Wind,
  Pocket,
  Type,
  Circle,
} from "@geist-ui/icons";
import { useNavigate } from "react-router-dom";
import { Rating } from "@components/Rating";
import "react-quill/dist/quill.snow.css";
import { useStore } from "@store";

const CustomSection = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        Custom Section
      </Text>
    </div>
  );
};
const Accomplishments = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        Accomplishments
      </Text>
    </div>
  );
};
const VolunteerExperience = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        VolunteerExperience
      </Text>
    </div>
  );
};
const Certifications = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        Certifications
      </Text>
    </div>
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
    <Card>
      <Text my={0} p font={1.5}>
        Languages
      </Text>
      <Text my={0} p type="secondary">
        Show experience level
      </Text>
      <Spacer />
      <Grid.Container gap={1.5}>
        {languages?.map((formObj) => (
          <Grid key={formObj.key} xs={24}>
            <Card mb={1} w={"100%"}>
              <Grid.Container gap={1.5}>
                <Grid xs={10.5}>
                  <Input
                    scale={1.25}
                    width="100%"
                    name="name"
                    id="name"
                    value={formObj.name}
                    placeholder="Skill Name"
                    onChange={(e) => setFieldValue(e, formObj.key)}
                  />
                </Grid>
                <Grid xs={10.5}>
                  <Rating
                    value={formObj.level}
                    onValueChange={(value) => {
                      setFieldValue(
                        { target: { value, name: "level" } },
                        formObj.key
                      );
                    }}
                    type="success"
                    icon={<Circle />}
                  />
                </Grid>
                <Grid xs={3}>
                  <Button
                    icon={<Trash />}
                    px={0.75}
                    auto
                    onClick={() => handleRemoveLanguage(formObj.key)}
                  />
                </Grid>
              </Grid.Container>
            </Card>
          </Grid>
        ))}
      </Grid.Container>
      <Spacer />
      <Button icon={<Plus />} auto onClick={handleAddMoreLanguages}>
        Add More Languages
      </Button>
    </Card>
  );
};
const References = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        Refs
      </Text>
    </div>
  );
};
const Interests = () => {
  return (
    <div>
      <Text my={0} p font={1.5}>
        Custom Section
      </Text>
    </div>
  );
};

const additionalSectionsOptions = [
  {
    id: 1,
    title: "Custom Section",
    component: CustomSection,
    icon: GridIcon,
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
    icon: Pocket,
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

const AdditionalSections = () => {
  const additionalSections = useStore((state) => state.additionalSections);
  const setAdditionalSections = useStore(
    (state) => state.setAdditionalSections
  );
  const navigate = useNavigate();
  return (
    <div>
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../education")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Add Additional Section
        </Text>
        <Spacer />
        <Grid.Container gap={2}>
          {additionalSectionsOptions.map((section) => (
            <Grid xs={24} sm={12} key={section.id} alignItems="center">
              <Button
                type="abort"
                icon={<section.icon />}
                auto
                onClick={() => {
                  if (additionalSections.find((s) => s.id === section.id)) {
                  } else {
                    setAdditionalSections([...additionalSections, section]);
                  }
                }}
              >
                {section.title}
              </Button>
            </Grid>
          ))}
        </Grid.Container>
        <Grid.Container gap={2}>
          {additionalSections.map((section) => {
            const Component = additionalSectionsOptions.find(
              (s) => s.id === section.id
            ).component;
            return (
              <Grid xs={24} key={section.id} alignItems="center">
                <Component id={section.id} />
              </Grid>
            );
          })}
        </Grid.Container>
      </Card>
    </div>
  );
};

export default AdditionalSections;
