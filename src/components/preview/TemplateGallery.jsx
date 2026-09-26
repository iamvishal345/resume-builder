import React, { useMemo, useState } from "react";
import { Dialog, DialogHeader } from "@astryxdesign/core/Dialog";
import { Button } from "@astryxdesign/core/Button";
import { HStack, VStack } from "@astryxdesign/core/Layout";
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
import { useI18n } from "@features/i18n/useI18n";
import "./gallery.css";

const Swatch = ({ templateId, active, onSelect, compareMode, slot }) => {
  const template = resolveTemplate(templateId);
  const preset = settingsFromTemplate(template);
  return (
    <button
      type="button"
      className={active ? "r-swatch r-swatch-active" : "r-swatch"}
      onClick={() => onSelect(preset, templateId)}
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
      <span className="r-swatch-name">
        {template.name}
        {compareMode && slot ? ` · ${slot}` : ""}
      </span>
    </button>
  );
};

const ComparePane = ({ templateId, label }) => {
  const template = resolveTemplate(templateId);
  const preset = useMemo(() => settingsFromTemplate(template), [templateId]);
  return (
    <div className="r-compare-pane">
      <Text type="inherit" size="sm" weight="semibold" color="primary">
        {label}: {template.name}
      </Text>
      <div className="r-compare-frame">
        <div className="r-compare-canvas">
          <Resume
            data={SAMPLE_RESUME}
            templateId={templateId}
            paletteId={preset.paletteId}
            fontId={preset.fontId}
            settings={preset}
          />
        </div>
      </div>
    </div>
  );
};

const TemplateGallery = ({ isOpen, onOpenChange, settings, onSelect }) => {
  const { t } = useI18n();
  const activeTemplate = resolveTemplate(settings?.templateId);
  const [category, setCategory] = useState(
    activeTemplate.category || RESUME_CATEGORIES[0].id,
  );
  const [compareMode, setCompareMode] = useState(false);
  const [leftId, setLeftId] = useState(activeTemplate.id);
  const [rightId, setRightId] = useState(
    RESUME_TEMPLATES.find((t) => t.id !== activeTemplate.id)?.id ||
      activeTemplate.id,
  );
  const [pickSlot, setPickSlot] = useState("left");
  const templates = templatesByCategory(category);

  const handleSwatch = (preset, templateId) => {
    if (!compareMode) {
      onSelect(preset);
      return;
    }
    if (pickSlot === "left") setLeftId(templateId);
    else setRightId(templateId);
  };

  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width={compareMode ? 920 : 760}
      maxHeight="80dvh"
      padding={2}
    >
      <DialogHeader
        title={t("templatesGallery.title") || "Choose a template"}
        subtitle={
          compareMode
            ? (t("templatesGallery.compareSubtitle") || "Pick left and right templates, then apply one. Content is preserved.")
            : (t("templatesGallery.subtitle") || "All type of layouts — sidebar, single column, split. Content is preserved.")
        }
        onOpenChange={onOpenChange}
      />
      <div className="r-gallery-scroll">
        <VStack gap={4} width="100%" padding={2}>
          <HStack gap={2} wrap>
            <Button
              size="sm"
              variant={compareMode ? "primary" : "secondary"}
              label={compareMode ? (t("templatesGallery.compareOn") || "Compare on") : (t("templatesGallery.compareSideBySide") || "Compare side-by-side")}
              onClick={() => setCompareMode((v) => !v)}
            />
            {compareMode ? (
              <>
                <Button
                  size="sm"
                  variant={pickSlot === "left" ? "primary" : "ghost"}
                  label={t("templatesGallery.pickLeft") || "Pick left"}
                  onClick={() => setPickSlot("left")}
                />
                <Button
                  size="sm"
                  variant={pickSlot === "right" ? "primary" : "ghost"}
                  label={t("templatesGallery.pickRight") || "Pick right"}
                  onClick={() => setPickSlot("right")}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  label={t("templatesGallery.applyLeft") || "Apply left"}
                  onClick={() =>
                    onSelect(settingsFromTemplate(resolveTemplate(leftId)))
                  }
                />
                <Button
                  size="sm"
                  variant="primary"
                  label={t("templatesGallery.applyRight") || "Apply right"}
                  onClick={() =>
                    onSelect(settingsFromTemplate(resolveTemplate(rightId)))
                  }
                />
              </>
            ) : null}
          </HStack>

          {compareMode ? (
            <div className="r-compare-grid">
              <ComparePane templateId={leftId} label={t("templatesGallery.pickLeft") || "Left"} />
              <ComparePane templateId={rightId} label={t("templatesGallery.pickRight") || "Right"} />
            </div>
          ) : null}

          <div className="r-chip-row">
            {RESUME_CATEGORIES.map((cat) => (
              <Button
                key={cat.id}
                size="sm"
                variant={category === cat.id ? "primary" : "ghost"}
                label={t(`templatesGallery.categories.${cat.id}`) || cat.name}
                onClick={() => setCategory(cat.id)}
              />
            ))}
          </div>

          <div className="r-gallery-grid">
            {templates.map((t) => (
              <Swatch
                key={t.id}
                templateId={t.id}
                active={
                  compareMode
                    ? t.id === leftId || t.id === rightId
                    : t.id === settings?.templateId
                }
                compareMode={compareMode}
                slot={
                  compareMode
                    ? t.id === leftId
                      ? "L"
                      : t.id === rightId
                        ? "R"
                        : ""
                    : ""
                }
                onSelect={handleSwatch}
              />
            ))}
          </div>

          <Text type="inherit" size="sm" color="secondary">
            {t("templatesGallery.countHint", { count: RESUME_TEMPLATES.length }) || `${RESUME_TEMPLATES.length} templates · tweak any layout in Customize`}
          </Text>
        </VStack>
      </div>
    </Dialog>
  );
};

export default TemplateGallery;
