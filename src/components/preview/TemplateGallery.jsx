import React, { useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Resume } from "@features/resume/Resume";
import { SAMPLE_RESUME } from "@features/resume/sample";
import {
  RESUME_CATEGORIES,
  RESUME_TEMPLATES,
  resolveTemplate,
  settingsFromTemplate,
  templatesByCategory,
} from "@features/resume/templates";
import "./gallery.css";

const Swatch = ({ templateId, active, onSelect }) => {
  const template = resolveTemplate(templateId);
  const preset = settingsFromTemplate(template);
  return (
    <button
      type="button"
      className={active ? "r-swatch r-swatch-active" : "r-swatch"}
      onClick={() => onSelect(preset)}
    >
      <span className="r-swatch-frame">
        <span className="r-swatch-canvas">
          <Resume
            data={SAMPLE_RESUME}
            templateId={templateId}
            paletteId={preset.paletteId}
            fontId={preset.fontId}
            settings={preset}
          />
        </span>
      </span>
      <span className="r-swatch-name">{template.name}</span>
    </button>
  );
};

const TemplateGallery = ({ isOpen, onOpenChange, settings, onSelect }) => {
  const activeTemplate = resolveTemplate(settings?.templateId);
  const [category, setCategory] = useState(
    activeTemplate.category || RESUME_CATEGORIES[0].id,
  );
  const templates = templatesByCategory(category);

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={760}
      maxHeight="80dvh"
      padding={2}
    >
      <DialogHeader
        title="Choose a template"
        subtitle="Zety-style layouts — sidebar, single column, split, and multiple skill styles. Content is preserved."
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={4} width="100%" padding={2}>
          <div className="r-chip-row">
            {RESUME_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={category === cat.id ? "primary" : "ghost"}
                label={cat.name}
                onClick={() => setCategory(cat.id)}
              />
            ))}
          </div>

          <div className="r-gallery-grid">
            {templates.map((t) => (
              <Swatch
                key={t.id}
                templateId={t.id}
                active={t.id === settings?.templateId}
                onSelect={onSelect}
              />
            ))}
          </div>

          <Text type="inherit" size="sm" color="secondary">
            {RESUME_TEMPLATES.length} templates · tweak any layout in Customize
          </Text>
        </VStack>
      </div>
    </Dialog>
  );
};

export default TemplateGallery;
