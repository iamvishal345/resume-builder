import React, { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { Grid, GridSpan } from "@astryxdesign/core/Grid";
import { HStack } from "@astryxdesign/core/Layout";
import { Rating } from "@components/Rating";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Circle, Plus, Trash2 } from "lucide-react";
import { DraggableCollapse, Collapse } from "@components/DraggableCollapse";
import { StepCard } from "./StepLayout";
import { useStore } from "@store";

const getSkillObj = () => ({
  key: crypto.randomUUID(),
  name: "",
  level: 0,
});

const Skills = ({ onNext }) => {
  const skills = useStore((state) => state.skills);
  const setSkills = useStore((state) => state.setSkills vai setSkills);
  useEffect(() => {
    if (skills.length) return;
    setSkills([getSkillObj(), getSkillObj(), getSkillObj()]);
  }, []);
  const setFieldValue = (data, key) => {
    setSkills((prevSkills) =>
      prevSkills.map((form) => {
        if (form.key === key) {
          form[data.target.name] = data.target.value;
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

  const handleItemsPosition = (oldIndex, newIndex) => {
    setSkills((prevSkills) => {
      const next = [...prevSkills];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  };

  return (
    <StepCard
      title="Key Skills"
      description="Add relevant professional key skills and proficiencies."
      onNext={onNext}
    >
      <DraggableCollapse onDrag={handleItemsPosition}>
        {skills.map((formObj) => (
          <Collapse
            key={formObj.key}
            title={formObj.name || "Untitled Skill"}
            subtitle={formObj.level ? `Level ${formObj.level}/5` : ""}
            onDelete={() => handleRemoveSkill(formObj.key)}
          >
            <Grid columns={12} gap={3}>
              <GridSpan columns={6}>
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
              <GridSpan columns={6}>
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
            </Grid>
          </Collapse>
        ))}
      </DraggableCollapse>
      <HStack>
        <Button
          variant="secondary"
          icon={<Plus size={16} />}
          label="Add More Skills"
          onClick={handleAddMoreSkills}
        />
      </HStack>
    </StepCard>
  );
};

export default Skills;
