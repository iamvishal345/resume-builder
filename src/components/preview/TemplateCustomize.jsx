import React from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Selector } from "@astryxdesign/core/Selector";
import { RESUME_PALETTES } from "@features/resume/palettes";
import { RESUME_FONTS } from "@features/resume/fonts";
import {
  LAYOUT_OPTIONS,
  HEADER_ALIGNS,
  HEADER_STYLES,
  SKILL_STYLES,
  LANGUAGE_STYLES,
  EXPERIENCE_STYLES,
  RESUME_DENSITIES,
} from "@features/resume/style";
import "./gallery.css";

const Chip = ({ label, active, onClick }) => (
  <button
    type="button"
    className={active ? "r-opt-chip r-opt-chip-active" : "r-opt-chip"}
    onClick={onClick}
  >
    {label}
  </button>
);

const ColorField = ({ label, value, onChange }) => (
  <div className="r-color-field">
    <span className="r-color-label">{label}</span>
    <span className="r-color-wrap">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="r-color-input"
        aria-label={label}
      />
      <span className="r-color-hex">{value}</span>
    </span>
  </div>
);

const RangeField = ({ label, value, min, max, step, suffix, onChange }) => (
  <div className="r-range-field">
    <span className="r-range-label">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="r-range"
    />
    <span className="r-range-value">
      {value}
      {suffix}
    </span>
  </div>
);

const SectionTitle = ({ children }) => (
  <Text type="large" weight="semibold" color="primary">
    {children}
  </Text>
);

const ChipGroup = ({ label, options, value, onChange, valueKey }) => (
  <div className="r-opt-group">
    <span className="r-opt-group-label">{label}</span>
    <div className="r-opt-row">
      {options.map((opt) => (
        <Chip
          key={opt.id}
          label={opt.name}
          active={value === opt.id}
          onClick={() => onChange({ [valueKey]: opt.id })}
        />
      ))}
    </div>
  </div>
);

const TemplateCustomize = ({ isOpen, onOpenChange, settings, onSelect }) => {
  const hasOverrides =
    settings &&
    (settings.primaryColor !== "" ||
      settings.bgColor !== "" ||
      settings.textColor !== "" ||
      settings.fontSize !== 14 ||
      settings.lineHeight !== 1.5 ||
      settings.sectionSpacing !== 16);

  const resetCustomization = () =>
    onSelect({
      primaryColor: "",
      bgColor: "",
      textColor: "",
      fontSize: 14,
      lineHeight: 1.5,
      sectionSpacing: 16,
    });

  const isSidebar =
    settings?.layoutId === "sidebar" || settings?.layoutId === "sidebar-right";

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={760}
      maxHeight="80dvh"
      padding={2}
    >
      <DialogHeader
        title="Layout & theme"
        subtitle="Structure, header, skills, languages, experience — applied live to the preview."
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={4} width="100%" padding={2}>
          <VStack gap={3} width="100%">
            <SectionTitle>Structure</SectionTitle>
            <div className="r-opt-groups">
              <ChipGroup
                label="Layout"
                options={LAYOUT_OPTIONS}
                value={settings?.layoutId}
                valueKey="layoutId"
                onChange={onSelect}
              />
              {isSidebar ? (
                <ChipGroup
                  label="Sidebar tone"
                  options={[
                    { id: "light", name: "Light" },
                    { id: "dark", name: "Dark" },
                    { id: "accent", name: "Accent" },
                  ]}
                  value={settings?.sidebarTone || "light"}
                  valueKey="sidebarTone"
                  onChange={onSelect}
                />
              ) : null}
              <ChipGroup
                label="Header align"
                options={HEADER_ALIGNS}
                value={settings?.headerAlign || "left"}
                valueKey="headerAlign"
                onChange={onSelect}
              />
              <ChipGroup
                label="Header style"
                options={HEADER_STYLES}
                value={settings?.headerStyle || "plain"}
                valueKey="headerStyle"
                onChange={onSelect}
              />
              <ChipGroup
                label="Density"
                options={RESUME_DENSITIES}
                value={settings?.density || "normal"}
                valueKey="density"
                onChange={onSelect}
              />
              <ChipGroup
                label="Photo"
                options={[
                  { id: "on", name: "Show if set" },
                  { id: "off", name: "Hide (ATS)" },
                ]}
                value={settings?.showPhoto === false ? "off" : "on"}
                valueKey="showPhoto"
                onChange={(patch) =>
                  onSelect({ showPhoto: patch.showPhoto !== "off" })
                }
              />
              <ChipGroup
                label="DOCX export"
                options={[
                  { id: "ats", name: "ATS single-column" },
                  { id: "preview", name: "Match preview (best effort)" },
                ]}
                value={settings?.docxLayout || "ats"}
                valueKey="docxLayout"
                onChange={onSelect}
              />
            </div>
          </VStack>

          <VStack gap={3} width="100%">
            <SectionTitle>Section styles</SectionTitle>
            <div className="r-opt-groups">
              <ChipGroup
                label="Skills"
                options={SKILL_STYLES}
                value={settings?.skillStyle || "chips"}
                valueKey="skillStyle"
                onChange={onSelect}
              />
              <ChipGroup
                label="Languages"
                options={LANGUAGE_STYLES}
                value={settings?.languageStyle || "dots"}
                valueKey="languageStyle"
                onChange={onSelect}
              />
              <ChipGroup
                label="Experience"
                options={EXPERIENCE_STYLES}
                value={settings?.experienceStyle || "standard"}
                valueKey="experienceStyle"
                onChange={onSelect}
              />
            </div>
          </VStack>

          <VStack gap={3} width="100%">
            <SectionTitle>Colors</SectionTitle>
            <div className="r-palette-row">
              {RESUME_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  className={
                    settings?.paletteId === palette.id
                      ? "r-palette-dot r-palette-dot-active"
                      : "r-palette-dot"
                  }
                  style={{ background: palette.accent }}
                  title={palette.name}
                  aria-label={palette.name}
                  onClick={() => onSelect({ paletteId: palette.id })}
                />
              ))}
            </div>
            <HStack gap={3} wrap width="100%">
              <ColorField
                label="Accent"
                value={settings?.primaryColor || "#0F172A"}
                onChange={(v) => onSelect({ primaryColor: v })}
              />
              <ColorField
                label="Background"
                value={settings?.bgColor || "#ffffff"}
                onChange={(v) => onSelect({ bgColor: v })}
              />
              <ColorField
                label="Text"
                value={settings?.textColor || "#0F172A"}
                onChange={(v) => onSelect({ textColor: v })}
              />
            </HStack>
          </VStack>

          <VStack gap={3} width="100%">
            <SectionTitle>Typography</SectionTitle>
            <Selector
              label="Font"
              value={settings?.fontId || "sans"}
              onChange={(v) => onSelect({ fontId: v })}
              options={RESUME_FONTS.map((f) => ({
                value: f.id,
                label: f.name,
              }))}
            />
            <RangeField
              label="Size"
              value={settings?.fontSize ?? 14}
              min={11}
              max={18}
              step={1}
              suffix="px"
              onChange={(v) => onSelect({ fontSize: v })}
            />
            <RangeField
              label="Line height"
              value={settings?.lineHeight ?? 1.5}
              min={1.15}
              max={1.9}
              step={0.05}
              suffix=""
              onChange={(v) => onSelect({ lineHeight: v })}
            />
            <RangeField
              label="Section spacing"
              value={settings?.sectionSpacing ?? 16}
              min={8}
              max={28}
              step={1}
              suffix="px"
              onChange={(v) => onSelect({ sectionSpacing: v })}
            />
          </VStack>

          {hasOverrides ? (
            <HStack justify="end" width="100%">
              <Button
                variant="ghost"
                size="sm"
                label="Reset color & type overrides"
                onClick={resetCustomization}
              />
            </HStack>
          ) : null}
        </VStack>
      </div>
    </Dialog>
  );
};

export default TemplateCustomize;
