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
  templatesByCategory,
} from "@features/resume/templates";
import "./gallery.css";

const Swatch = ({ templateId, active, settings, onSelect }) => {
  const template = resolveTemplate(templateId);
  return (
    <button
      type="button"
      className={active ? "r-swatch r-swatch-active" : "r-swatch"}
      onClick={() =>
        onSelect({
          templateId,
          paletteId: template.palette,
          fontId: template.font,
          layoutId: template.layout,
        })
      }
    >
      <span className="r-swatch-frame">
        <span className="r-swatch-canvas">
          <Resume
            data={SAMPLE_RESUME}
            templateId={templateId}
            settings={{ ...settings, layoutId: template.layout }}
          />
        </span>
      </span>
      <span className="r-swatch-name">{template.name}</span>
    </button>
  );
};

const TemplateGallery = ({ isOpen, onOpenChange, settings, onSelect }) => {
  const activeTemplate = resolveTemplate(settings?.templateId);
  const [category, setCategory] = useState(activeTemplate.category);
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
        subtitle="Content is preserved — switch anytime. Tweak layout, colors and typography from the preview pane."
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
                settings={settings}
                onSelect={onSelect}
              />
            ))}
          </div>

          <Text type="inherit" size="sm" color="secondary">
            {RESUME_TEMPLATES.length} templates · ATS-safe options included
          </Text>
        </VStack>
      </div>
    </Dialog>
  );
};

export default TemplateGallery;
