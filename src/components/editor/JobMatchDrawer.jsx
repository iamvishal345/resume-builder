import React, { useMemo, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { TextArea } from "@astryxdesign/core/TextArea";
import { Check, Copy, Plus, FileText } from "lucide-react";
import { analyzeJd, resumeTextOf } from "@features/jdmatch/analyze";
import { useStore } from "@store";
import SideDrawer from "./SideDrawer";

const Keyword = ({ label, present }) => (
  <span className={present ? "jdm-chip jdm-present" : "jdm-chip jdm-missing"}>
    {present ? <Check size={12} /> : <Plus size={12} />}
    {label}
  </span>
);

const JobMatchDrawer = ({ isOpen, onOpenChange, data }) => {
  const [jd, setJd] = useState("");
  const skills = useStore((state) => state.skills);
  const setSkills = useStore((state) => state.setSkills);
  const [copied, setCopied] = useState(false);

  const resumeText = useMemo(() => resumeTextOf(data), [data]);
  const analysis = useMemo(() => analyzeJd(jd, resumeText), [jd, resumeText]);

  const matchPct = analysis.total
    ? Math.round((analysis.matched / analysis.total) * 100)
    : 0;

  const copyMissing = async () => {
    if (!analysis.missing.length) return;
    try {
      await navigator.clipboard.writeText(
        analysis.missing.map((k) => k.term).join(", ")
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const addMissingToSkills = () => {
    const existing = new Set(skills.map((s) => s.name.toLowerCase()));
    const additions = analysis.missing
      .filter((k) => !existing.has(k.term.toLowerCase()))
      .slice(0, 12)
      .map((k) => ({ name: k.term, rating: 1 }));
    if (additions.length) setSkills([...skills, ...additions]);
  };

  return (
    <SideDrawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Job match"
      subtitle="Paste a job description to compare it with your resume."
    >
      <VStack gap={3} width="100%">
        <TextArea
          label="Job description"
          value={jd}
          onChange={(v) => setJd(v)}
          rows={6}
          width="100%"
          placeholder="Paste the full job posting here — keywords are extracted automatically and never leave your browser."
        />

        {analysis.total > 0 ? (
          <VStack gap={3} width="100%">
            <HStack justify="between" align="center" width="100%">
              <VStack gap={0}>
                <Text
                  type="inherit"
                  size="lg"
                  weight="semibold"
                  color="primary"
                >
                  {matchPct}% keyword match
                </Text>
                <Text type="inherit" size="sm" color="secondary">
                  {analysis.matched} of {analysis.total} JD keywords already on
                  your resume
                </Text>
              </VStack>
              <FileText size={22} color="var(--color-accent)" />
            </HStack>

            <VStack gap={1} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Present on your resume ({analysis.present.length})
              </Text>
              <div className="jdm-chip-row">
                {analysis.present.map((k) => (
                  <Keyword key={k.term} label={k.term} present />
                ))}
              </div>
            </VStack>

            <VStack gap={1} width="100%">
              <Text type="inherit" size="sm" weight="semibold" color="primary">
                Missing — consider weaving these in ({analysis.missingCount})
              </Text>
              <div className="jdm-chip-row">
                {analysis.missing.map((k) => (
                  <Keyword key={k.term} label={k.term} present={false} />
                ))}
              </div>
            </VStack>

            <HStack gap={2} align="center" width="100%">
              <Button
                variant="secondary"
                size="sm"
                icon={copied ? <Check size={14} /> : <Copy size={14} />}
                label={copied ? "Copied" : "Copy missing keywords"}
                onClick={copyMissing}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={<Plus size={14} />}
                label="Add missing to skills"
                onClick={addMissingToSkills}
              />
            </HStack>

            <Text type="inherit" size="sm" color="secondary">
              These are suggestions — only keep the missing terms you genuinely
              know, so your resume stays truthful for interviews.
            </Text>
          </VStack>
        ) : (
          <Text type="inherit" size="sm" color="secondary">
            Analysis appears here as you paste a job description.
          </Text>
        )}
      </VStack>
    </SideDrawer>
  );
};

export default JobMatchDrawer;