import { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Sparkles } from "lucide-react";
import { StepCard } from "./StepLayout";
import { RatedNameList } from "./RatedNameList";
import { useStore } from "@store";
import { normalizeSkill } from "@features/resume/skillList";
import { isAiAvailable } from "@features/ai/provider";
import { suggestSkillsFromExperience } from "@features/ai/skillsFromExperience";

const getSkillObj = () => normalizeSkill({});

const Skills = ({ onNext, onPrev, nextLabel }) => {
  const skills = useStore((state) => state.skills);
  const setSkills = useStore((state) => state.setSkills);
  const workHistory = useStore((state) => state.workHistory);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState("");
  const [proposed, setProposed] = useState([]);

  useEffect(() => {
    if (skills.length) return;
    setSkills([getSkillObj(), getSkillObj(), getSkillObj()]);
  }, []);

  const suggest = async () => {
    setHint("");
    setBusy(true);
    try {
      const next = await suggestSkillsFromExperience(workHistory, skills);
      setProposed(next);
      setHint(
        next.length
          ? `Found ${next.length} skill(s) from your experience.`
          : "No new skills found — try adding more detail to experience.",
      );
    } catch (e) {
      setHint(e?.message || "Could not suggest skills.");
      setProposed([]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <StepCard
      title="Key Skills"
      description="One flat list — add, rate, drag to reorder, or remove."
      onNext={onNext}
      onPrev={onPrev}
      nextLabel={nextLabel}
    >
      <VStack gap={3} width="100%">
        <HStack gap={2} wrap>
          <Button
            size="sm"
            variant="secondary"
            icon={<Sparkles size={14} />}
            label={busy ? "Suggesting…" : "Suggest from experience"}
            disabled={busy || !isAiAvailable()}
            onClick={suggest}
          />
          {!isAiAvailable() ? (
            <Text type="inherit" size="sm" color="secondary">
              Enable AI in preferences to suggest skills locally.
            </Text>
          ) : null}
        </HStack>
        {hint ? (
          <Text type="inherit" size="sm" color="secondary">
            {hint}
          </Text>
        ) : null}
        {proposed.length ? (
          <VStack gap={2} width="100%">
            <HStack gap={1} wrap>
              {proposed.map((s) => (
                <Button
                  key={s.name}
                  size="sm"
                  variant="ghost"
                  label={`+ ${s.name}`}
                  onClick={() => {
                    setSkills([...skills, s]);
                    setProposed((list) =>
                      list.filter((p) => p.name !== s.name),
                    );
                  }}
                />
              ))}
            </HStack>
            <Button
              size="sm"
              variant="secondary"
              label="Add all"
              onClick={() => {
                setSkills([...skills, ...proposed]);
                setProposed([]);
              }}
            />
          </VStack>
        ) : null}
        <RatedNameList
          items={skills}
          onItemsChange={setSkills}
          createItem={getSkillObj}
          nameLabel="Skill"
          namePlaceholder="e.g. TypeScript"
          addLabel="Add skill"
          showLevel
        />
      </VStack>
    </StepCard>
  );
};

export default Skills;
