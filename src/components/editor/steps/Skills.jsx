import { useEffect } from "react";
import { StepCard } from "./StepLayout";
import { RatedNameList } from "./RatedNameList";
import { useStore } from "@store";
import { normalizeSkill } from "@features/resume/skillList";

const getSkillObj = () => normalizeSkill({});

const Skills = ({ onNext, onPrev, nextLabel }) => {
  const skills = useStore((state) => state.skills);
  const setSkills = useStore((state) => state.setSkills);

  useEffect(() => {
    if (skills.length) return;
    setSkills([getSkillObj(), getSkillObj(), getSkillObj()]);
  }, []);

  return (
    <StepCard
      title="Key Skills"
      description="One flat list — add, rate, drag to reorder, or remove."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <RatedNameList
        items={skills}
        onItemsChange={setSkills}
        createItem={getSkillObj}
        nameLabel="Skill"
        namePlaceholder="e.g. TypeScript"
        addLabel="Add skill"
        showLevel
      />
    </StepCard>
  );
};

export default Skills;
