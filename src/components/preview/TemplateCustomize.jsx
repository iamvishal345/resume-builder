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
  RESUME_DENSITIES,
  RESUME_HEADER_STYLES,
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
        subtitle="Applies live to the resume preview — layout, header, density, colors and typography."
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={4} width="100%" padding={2}>
          <VStack gap={3} width="100%">
            <SectionTitle>Layout</SectionTitle>
            <div className="r-opt-groups">
              <div className="r-opt-group">
                <span className="r-opt-group-label">Structure</span>
                <div className="r-opt-row">
                  {LAYOUT_OPTIONS.map((layout) => (
                    <Chip
                      key={layout.id}
                      label={layout.name}
                      active={settings?.layoutId === layout.id}
                      onClick={() => onSelect({ layoutId: layout.id })}
                    />
                  ))}
                </div>
              </div>
              <div className="r-opt-group">
                <span className="r-opt-group-label">Header</span>
                <div className="r-opt-row">
                  {RESUME_HEADER_STYLES.map((h) => (
                    <Chip
                      key={h.id}
                      label={h.name}
                      active={settings?.headerStyle === h.id}
                      onClick={() => onSelect({ headerStyle: h.id })}
                    />
                  ))}
                </div>
              </div>
              <div className="r-opt-group">
                <span className="r-opt-group-label">Density</span>
                <div className="r-opt-row">
                  {RESUME_DENSITIES.map((d) => (
                    <Chip
                      key={d.id}
                      label={d.name}
                      active={settings?.density === d.id}
                      onClick={() => onSelect({ density: d.id })}
                    />
                  ))}
                </div>
              </div>
            </div>
          </VStack>

          <VStack gap={3} width="100%">
            <SectionTitle>Colors</SectionTitle>
            <div className="r-chip-row">
              {RESUME_PALETTES.map((palette) => (
                <button
                  type="button"
                  key={palette.id}
                  className={
                    settings?.paletteId === palette.id
                      ? "r-palette-dot r-palette-dot-active"
                      : "r-palette-dot"
                  }
                  title={palette.name}
                  aria-label={`${palette.name} color theme`}
                  onClick={() =>
                    onSelect({
                      paletteId: palette.id,
                      primaryColor: "",
                      bgColor: "",
                      textColor: "",
                    })
                  }
                  style={{ background: palette.accent }}
                >
                  <span className="r-palette-ring" />
                </button>
              ))}
            </div>
            <div className="r-color-row">
              <ColorField
                label="Primary accent"
                value={
                  settings?.primaryColor ||
                  RESUME_PALETTES.find((p) => p.id === settings?.paletteId)
                    ?.accent ||
                  "#0f172a"
                }
                onChange={(c) => onSelect({ primaryColor: c })}
              />
              <ColorField
                label="Background"
                value={settings?.bgColor || "#ffffff"}
                onChange={(c) => onSelect({ bgColor: c })}
              />
              <ColorField
                label="Text"
                value={settings?.textColor || "#111827"}
                onChange={(c) => onSelect({ textColor: c })}
              />
            </div>
          </VStack>

          <VStack gap={3} width="100%">
            <SectionTitle>Typography</SectionTitle>
            <Selector
              label="Font"
              width={260}
              value={settings?.fontId}
              options={RESUME_FONTS.map((f) => ({
                value: f.id,
                label: f.name,
              }))}
              onChange={(value) => onSelect({ fontId: value })}
            />
            <div className="r-range-grid">
              <RangeField
                label="Font size"
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
            </div>
          </VStack>

          {hasOverrides && (
            <HStack gap={3} align="center" width="100%">
              <Button
                size="sm"
                variant="ghost"
                label="Reset colors & spacing"
                onClick={resetCustomization}
              />
              <Text type="inherit" size="sm" color="secondary">
                Custom values override the template — picked palettes clear
                them.
              </Text>
            </HStack>
          )}
        </VStack>
      </div>
    </Dialog>
  );
};

export default TemplateCustomize;
