import { HStack } from "@astryxdesign/core/Layout";
import { Button } from "@astryxdesign/core/Button";
import { Check } from "lucide-react";

export const STEPS = [
  { id: "personal-details", label: "Details" },
  { id: "summary", label: "Summary" },
  { id: "work-history", label: "Experience" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "additional-sections", label: "Extras" },
];

const Stepper = ({ stepIndex, onJump }) => (
  <HStack
    gap={1}
    justify="start"
    width="100%"
    className="editor-stepper"
    role="tablist"
    aria-label="Resume sections"
  >
    {STEPS.map((step, index) => {
      const done = index < stepIndex;
      const active = index === stepIndex;
      return (
        <Button
          key={step.id}
          variant={active ? "primary" : done ? "secondary" : "ghost"}
          size="sm"
          label={step.label}
          icon={done ? <Check size={13} /> : null}
          onClick={() => onJump(index)}
        />
      );
    })}
  </HStack>
);

export default Stepper;
