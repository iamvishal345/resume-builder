import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/Layout";
import { Check } from "lucide-react";
import { useI18n } from "@features/i18n/useI18n";

export const STEPS = [
  { id: "personal-details", labelKey: "steps.details" },
  { id: "summary", labelKey: "steps.summary" },
  { id: "work-history", labelKey: "steps.experience" },
  { id: "education", labelKey: "steps.education" },
  { id: "skills", labelKey: "steps.skills" },
  { id: "additional-sections", labelKey: "steps.extras" },
];

/** Static English labels for command palette / non-React callers. */
export const STEP_LABELS_EN = [
  "Details",
  "Summary",
  "Experience",
  "Education",
  "Skills",
  "Extras",
];

const Stepper = ({ stepIndex, onJump }) => {
  const { t } = useI18n();
  return (
    <HStack
      gap={1}
      justify="start"
      wrap="wrap"
      className="editor-stepper"
      role="tablist"
      aria-label={t("steps.label")}
    >
      {STEPS.map((step, index) => {
        const done = index < stepIndex;
        const active = index === stepIndex;
        return (
          <Button
            key={step.id}
            variant={active ? "primary" : done ? "secondary" : "ghost"}
            size="sm"
            label={t(step.labelKey)}
            icon={done ? <Check size={13} /> : null}
            role="tab"
            aria-selected={active}
            onClick={() => onJump(index)}
          />
        );
      })}
    </HStack>
  );
};

export default Stepper;
