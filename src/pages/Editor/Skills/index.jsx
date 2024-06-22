import React, { useEffect, useState } from "react";
import { Button, Card, Grid, Input, Spacer, Text } from "@geist-ui/core";
import { ArrowRight, Award, Circle, Move, Plus, Trash } from "@geist-ui/icons";
import { useNavigate } from "react-router-dom";
import { Rating } from "@components/Rating";

import { useStore } from "@store";

const getSkillObj = () => ({
  key: crypto.randomUUID(),
  name: "",
  level: 0,
});

const Skills = () => {
  const skills = useStore((state) => state.skills);
  const setSkills = useStore((state) => state.setSkills);
  useEffect(() => {
    if (skills.length) return;
    setSkills([getSkillObj(), getSkillObj(), getSkillObj()]);
  }, []);
  const navigate = useNavigate();
  const setFieldValue = (e, key) => {
    setSkills(
      skills.map((form) => {
        if (form.key === key) {
          form[e.target.name] = e.target.value;
        }
        return form;
      })
    );
  };

  const handleAddMoreSkills = () => {
    setSkills([...skills, getSkillObj()]);
  };
  const handleRemoveSkill = (formKey) => {
    setSkills(skills.filter((form) => form.key !== formKey));
  };

  return (
    <div>
      <Grid style={{ display: "flex" }} px={0} justify="flex-end">
        <Button
          auto
          type="success-light"
          iconRight={<ArrowRight />}
          onClick={() => navigate("../summary")}
        >
          Next
        </Button>
      </Grid>
      <Card>
        <Text my={0} p font={1.5}>
          Key Skills
        </Text>
        <Text my={0} p type="secondary">
          Add relevant professional key skills and proficiencies.
        </Text>
        <Spacer />
        <Grid.Container gap={1.5}>
          {skills.map((formObj) => (
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
                      onClick={() => handleRemoveSkill(formObj.key)}
                    />
                  </Grid>
                </Grid.Container>
              </Card>
            </Grid>
          ))}
        </Grid.Container>
        <Spacer />
        <Button icon={<Plus />} auto onClick={handleAddMoreSkills}>
          Add More Skills
        </Button>
      </Card>
    </div>
  );
};

export default Skills;
