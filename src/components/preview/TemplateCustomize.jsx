import React, { useEffect, useId, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { Selector } from "@astryxdesign/core/Selector";
import { Text } from "@astryxdesign/core/Text";
import {
  ChevronDown,
  ChevronUp,
  Columns2,
  Copy,
  Layers,
  Palette,
  Sparkles,
  Trash2,
  Type,
  X,
} from "lucide-react";
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
  SIDEBAR_WIDTH_PRESETS,
  SIDEBAR_GAP_PRESETS,
  isSidebarLayout,
  isSplitLayout,
} from "@features/resume/style";
import {
  defaultSideColumn,
  defaultSplitColumn,
  effectiveOrder,
  isExtra,
  moveInOrder,
  extraIdOf,
} from "@features/resume/order";
import {
  listThemes,
  saveTheme,
  deleteTheme,
} from "@features/resumes/themes";
import { useStore } from "@store";
import "./customize-panel.css";

const TIP_KEY = "cavren-customize-tip-seen";

const TABS = [
  { id: "layout", label: "Layout", icon: Columns2 },
  { id: "style", label: "Style", icon: Sparkles },
  { id: "color", label: "Color", icon: Palette },
  { id: "type", label: "Type", icon: Type },
  { id: "sections", label: "Tune", icon: Layers },
];

const Block = ({ title, hint, children }) => (
  <section className="tcx-block">
    {title ? <h3 className="tcx-block-title">{title}</h3> : null}
    {hint ? <p className="tcx-block-hint">{hint}</p> : null}
    {children}
  </section>
);

const Seg = ({ label, options, value, onChange, cols }) => (
  <Block title={label}>
    <div
      className="tcx-seg"
      role="radiogroup"
      aria-label={label}
      data-cols={cols || Math.min(options.length, 4)}
    >
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "tcx-seg-btn tcx-seg-btn-active" : "tcx-seg-btn"}
            onClick={() => onChange(opt.id)}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  </Block>
);

const ValueSeg = ({ label, options, value, onChange }) => (
  <Block title={label}>
    <div
      className="tcx-seg"
      role="radiogroup"
      aria-label={label}
      data-cols={options.length}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "tcx-seg-btn tcx-seg-btn-active" : "tcx-seg-btn"}
            onClick={() => onChange(opt.value)}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  </Block>
);

const ChipRow = ({ label, options, value, onChange }) => (
  <Block title={label}>
    <div className="tcx-chips" role="list">
      {options.map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            role="listitem"
            className={active ? "tcx-chip tcx-chip-active" : "tcx-chip"}
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
          >
            {opt.name}
          </button>
        );
      })}
    </div>
  </Block>
);

const ColorField = ({ label, value, onChange }) => (
  <label className="tcx-color">
    <span className="tcx-color-label">{label}</span>
    <span className="tcx-color-wrap">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="tcx-color-input"
        aria-label={label}
      />
      <span className="tcx-color-hex">{value}</span>
    </span>
  </label>
);

const RangeField = ({ label, value, min, max, step, suffix, onChange }) => (
  <div className="tcx-range">
    <span className="tcx-range-label">{label}</span>
    <span className="tcx-range-value">
      {typeof value === "number" && step < 1 ? Number(value).toFixed(2) : value}
      {suffix}
    </span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      aria-label={label}
    />
  </div>
);

const MyThemes = ({ settings, onSelect }) => {
  const [themes, setThemes] = useState([]);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    try {
      setThemes(await listThemes());
    } catch {
      setThemes([]);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  const save = async () => {
    setBusy(true);
    try {
      await saveTheme(name || "My theme", settings);
      setName("");
      await reload();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Block
      title="My themes"
      hint="Saved on this device — palette, type, and layout knobs only."
    >
      <div className="tcx-theme-save">
        <input
          className="tcx-theme-input"
          type="text"
          value={name}
          placeholder="Theme name"
          aria-label="Theme name"
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          label={busy ? "Saving…" : "Save"}
          disabled={busy}
          onClick={save}
        />
      </div>
      {themes.length ? (
        <div className="tcx-theme-list">
          {themes.map((t) => (
            <div key={t.id} className="tcx-theme-row">
              <button
                type="button"
                className="tcx-chip"
                onClick={() => onSelect({ ...t.settings })}
              >
                {t.name}
              </button>
              <Button
                size="sm"
                variant="ghost"
                label="Delete"
                onClick={async () => {
                  await deleteTheme(t.id);
                  await reload();
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="tcx-block-hint">No saved themes yet.</p>
      )}
    </Block>
  );
};

/**
 * Layout & theme controls — left sidebar panel so the live preview stays visible.
 */
const TemplateCustomize = ({
  settings,
  onSelect,
  sections = [],
  onClose,
  showClose = true,
}) => {
  const titleId = useId();
  const sectionStyles = settings?.sectionStyles || {};
  const sectionCols = settings?.sectionCols || {};
  const hasSectionOverrides = Object.keys(sectionStyles).length > 0;
  const [tab, setTab] = useState("layout");
  const [selectedSection, setSelectedSection] = useState(
    sections[0]?.id || "header",
  );
  const [showTip, setShowTip] = useState(() => {
    try {
      return window.localStorage.getItem(TIP_KEY) !== "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!sections.some((s) => s.id === selectedSection) && sections[0]) {
      setSelectedSection(sections[0].id);
    }
  }, [sections, selectedSection]);

  useEffect(() => {
    if (!onClose) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const dismissTip = () => {
    setShowTip(false);
    try {
      window.localStorage.setItem(TIP_KEY, "1");
    } catch {
      /* private mode */
    }
  };

  const hasOverrides =
    settings &&
    (settings.primaryColor !== "" ||
      settings.bgColor !== "" ||
      settings.textColor !== "" ||
      settings.fontSize !== 14 ||
      settings.lineHeight !== 1.5 ||
      settings.sectionSpacing !== 16 ||
      settings.pagePadX !== 26 ||
      settings.pagePadY !== 30 ||
      settings.colGap !== 24 ||
      settings.nameSize !== 27 ||
      settings.photoSize !== 72 ||
      settings.sidebarWidth !== 32 ||
      hasSectionOverrides);

  const resetCustomization = () =>
    onSelect({
      primaryColor: "",
      bgColor: "",
      textColor: "",
      fontSize: 14,
      lineHeight: 1.5,
      sectionSpacing: 16,
      pagePadX: 26,
      pagePadY: 30,
      colGap: 24,
      nameSize: 27,
      photoSize: 72,
      radiusSm: 4,
      sidebarWidth: 32,
      sectionStyles: {},
    });

  const patchSection = (id, patch) => {
    const next = { ...(sectionStyles[id] || {}), ...patch };
    for (const key of Object.keys(next)) {
      if (next[key] == null || Number.isNaN(Number(next[key]))) delete next[key];
    }
    onSelect({ sectionStyles: { ...sectionStyles, [id]: next } });
  };

  const clearSection = (id) => {
    const next = { ...sectionStyles };
    delete next[id];
    onSelect({ sectionStyles: next });
  };

  const setSectionColumn = (id, col) => {
    onSelect({ sectionCols: { ...sectionCols, [id]: col } });
  };

  const selected = sectionStyles[selectedSection] || {};
  const baseFont = settings?.fontSize ?? 14;
  const baseLine = settings?.lineHeight ?? 1.5;
  const baseGap = settings?.sectionSpacing ?? 16;
  const isSidebar = isSidebarLayout(settings);
  const isSplit = isSplitLayout(settings);
  const isDarkSidebar = isSidebar && (settings?.sidebarTone || "light") === "dark";
  const sidebarWidth = settings?.sidebarWidth ?? 32;
  const colGap = settings?.colGap ?? 24;
  const widthIsPreset = SIDEBAR_WIDTH_PRESETS.some((p) => p.value === sidebarWidth);
  const gapIsPreset = SIDEBAR_GAP_PRESETS.some((p) => p.value === colGap);
  const showFineTune = !(widthIsPreset && gapIsPreset);
  const resolvedAccent =
    settings?.primaryColor ||
    RESUME_PALETTES.find((p) => p.id === settings?.paletteId)?.accent ||
    "#0F172A";

  const currentCol =
    sectionCols[selectedSection] ??
    (isSplit
      ? defaultSplitColumn(selectedSection)
      : defaultSideColumn(selectedSection));

  const pickPalette = (palette) =>
    onSelect({ paletteId: palette.id, primaryColor: "" });

  return (
    <aside className="tcx-panel" aria-labelledby={titleId}>
      <header className="tcx-head">
        <div className="tcx-head-copy">
          <span id={titleId}>
            <Text type="inherit" size="lg" weight="semibold" color="primary">
              Layout & theme
            </Text>
          </span>
          <Text type="inherit" size="sm" color="secondary">
            Changes apply live to the preview.
          </Text>
        </div>
        {showClose && onClose ? (
          <IconButton
            label="Close customize"
            tooltip="Close"
            variant="ghost"
            icon={<X size={18} />}
            onClick={onClose}
          />
        ) : null}
      </header>

      {showTip ? (
        <div className="tcx-tip" role="status">
          <p>
            Tip: switch tabs to change layout, colors, and type. In Tune, move
            a section between sidebar and main without dragging.
          </p>
          <Button size="sm" variant="ghost" label="Got it" onClick={dismissTip} />
        </div>
      ) : null}

      <nav className="tcx-nav" aria-label="Customize sections">
        {TABS.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={
                active ? "tcx-nav-btn tcx-nav-btn-active" : "tcx-nav-btn"
              }
              aria-current={active ? "page" : undefined}
              onClick={() => setTab(item.id)}
            >
              <Icon size={16} strokeWidth={2.25} aria-hidden />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="tcx-body">
        {tab === "layout" ? (
          <div className="tcx-stack">
            <Seg
              label="Page structure"
              options={LAYOUT_OPTIONS}
              value={settings?.layoutId}
              cols={2}
              onChange={(id) => onSelect({ layoutId: id })}
            />
            {isSidebar ? (
              <>
                <Seg
                  label="Sidebar tone"
                  options={[
                    { id: "light", name: "Light" },
                    { id: "dark", name: "Dark" },
                    { id: "accent", name: "Accent" },
                  ]}
                  value={settings?.sidebarTone || "light"}
                  cols={3}
                  onChange={(id) => onSelect({ sidebarTone: id })}
                />
                <ValueSeg
                  label="Sidebar width"
                  options={SIDEBAR_WIDTH_PRESETS}
                  value={sidebarWidth}
                  onChange={(v) => onSelect({ sidebarWidth: v })}
                />
                <ValueSeg
                  label="Sidebar gap"
                  options={SIDEBAR_GAP_PRESETS}
                  value={colGap}
                  onChange={(v) => onSelect({ colGap: v })}
                />
                {showFineTune ? (
                  <Block
                    title="Fine tune"
                    hint="Shown when width or gap is not on a preset."
                  >
                    <div className="tcx-ranges">
                      <RangeField
                        label="Width"
                        value={sidebarWidth}
                        min={20}
                        max={46}
                        step={1}
                        suffix="%"
                        onChange={(v) => onSelect({ sidebarWidth: v })}
                      />
                      <RangeField
                        label="Gap"
                        value={colGap}
                        min={0}
                        max={48}
                        step={1}
                        suffix="px"
                        onChange={(v) => onSelect({ colGap: v })}
                      />
                    </div>
                  </Block>
                ) : null}
              </>
            ) : null}
            {!isDarkSidebar ? (
              <>
                <Seg
                  label="Header align"
                  options={HEADER_ALIGNS}
                  value={settings?.headerAlign || "left"}
                  cols={2}
                  onChange={(id) => onSelect({ headerAlign: id })}
                />
                <ChipRow
                  label="Header style"
                  options={HEADER_STYLES}
                  value={settings?.headerStyle || "plain"}
                  onChange={(id) => onSelect({ headerStyle: id })}
                />
              </>
            ) : (
              <Block
                title="Header"
                hint="Dark sidebar uses the identity block in the rail — header style controls apply to light and accent tones."
              />
            )}
            <Seg
              label="Density"
              options={RESUME_DENSITIES}
              value={settings?.density || "normal"}
              cols={2}
              onChange={(id) => onSelect({ density: id })}
            />
            {!isDarkSidebar ? (
              <Seg
                label="Photo"
                options={[
                  { id: "on", name: "Show if set" },
                  { id: "off", name: "Hide (ATS)" },
                ]}
                value={settings?.showPhoto === false ? "off" : "on"}
                cols={2}
                onChange={(id) => onSelect({ showPhoto: id !== "off" })}
              />
            ) : null}
            <Seg
              label="DOCX export"
              options={[
                { id: "ats", name: "ATS column" },
                { id: "preview", name: "Match preview" },
              ]}
              value={settings?.docxLayout || "ats"}
              cols={2}
              onChange={(id) => onSelect({ docxLayout: id })}
            />
          </div>
        ) : null}

        {tab === "style" ? (
          <div className="tcx-stack">
            <ChipRow
              label="Skills"
              options={SKILL_STYLES}
              value={settings?.skillStyle || "chips"}
              onChange={(id) => onSelect({ skillStyle: id })}
            />
            <ChipRow
              label="Languages"
              options={LANGUAGE_STYLES}
              value={settings?.languageStyle || "dots"}
              onChange={(id) => onSelect({ languageStyle: id })}
            />
            <ChipRow
              label="Experience"
              options={EXPERIENCE_STYLES}
              value={settings?.experienceStyle || "standard"}
              onChange={(id) => onSelect({ experienceStyle: id })}
            />
          </div>
        ) : null}

        {tab === "color" ? (
          <div className="tcx-stack">
            <Block title="Palette" hint="Pick a preset, then override any color.">
              <div className="tcx-palette" role="list">
                {RESUME_PALETTES.map((palette) => {
                  const active =
                    (!settings?.primaryColor &&
                      settings?.paletteId === palette.id) ||
                    settings?.primaryColor === palette.accent;
                  return (
                    <button
                      key={palette.id}
                      type="button"
                      role="listitem"
                      className={
                        active ? "tcx-swatch tcx-swatch-active" : "tcx-swatch"
                      }
                      style={{ background: palette.accent }}
                      title={palette.name}
                      aria-label={palette.name}
                      aria-pressed={active}
                      onClick={() => pickPalette(palette)}
                    />
                  );
                })}
              </div>
            </Block>
            <Block title="Custom colors">
              <div className="tcx-colors">
                <ColorField
                  label="Accent"
                  value={resolvedAccent}
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
              </div>
            </Block>
            <MyThemes settings={settings} onSelect={onSelect} />
          </div>
        ) : null}

        {tab === "type" ? (
          <div className="tcx-stack">
            <Block title="Font">
              <div className="tcx-font">
                <Selector
                  label="Typeface"
                  value={settings?.fontId || "sans"}
                  onChange={(v) => onSelect({ fontId: v })}
                  options={RESUME_FONTS.map((f) => ({
                    value: f.id,
                    label: f.name,
                  }))}
                />
              </div>
            </Block>
            <Block title="Typography">
              <div className="tcx-ranges">
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
              </div>
            </Block>
            <Block title="Page">
              <div className="tcx-theme-row" role="group" aria-label="Paper size">
                {[
                  { id: "a4", name: "A4" },
                  { id: "letter", name: "US Letter" },
                ].map((opt) => {
                  const active = (settings?.paperSize || "a4") === opt.id;
                  return (
                    <Button
                      key={opt.id}
                      size="sm"
                      variant={active ? "primary" : "secondary"}
                      label={opt.name}
                      aria-pressed={active}
                      onClick={() => onSelect({ paperSize: opt.id })}
                    />
                  );
                })}
              </div>
              <div className="tcx-ranges">
                <RangeField
                  label="Page padding"
                  value={settings?.pagePadX ?? 26}
                  min={10}
                  max={60}
                  step={1}
                  suffix="px"
                  onChange={(v) => onSelect({ pagePadX: v, pagePadY: v })}
                />
                {isSplit ? (
                  <RangeField
                    label="Column gap"
                    value={colGap}
                    min={4}
                    max={48}
                    step={1}
                    suffix="px"
                    onChange={(v) => onSelect({ colGap: v })}
                  />
                ) : null}
                <RangeField
                  label="Name size"
                  value={settings?.nameSize ?? 27}
                  min={16}
                  max={44}
                  step={1}
                  suffix="px"
                  onChange={(v) => onSelect({ nameSize: v })}
                />
                <RangeField
                  label="Photo size"
                  value={settings?.photoSize ?? 72}
                  min={40}
                  max={140}
                  step={2}
                  suffix="px"
                  onChange={(v) => onSelect({ photoSize: v })}
                />
              </div>
            </Block>
            <MyThemes settings={settings} onSelect={onSelect} />
          </div>
        ) : null}

        {tab === "sections" ? (
          <div className="tcx-stack">
            {sections.length ? (
              <>
                <Block
                  title="Section"
                  hint="Overrides apply only to the selected section. Reorder extras and base sections here."
                >
                  <div className="tcx-chips">
                    {sections.map((sec) => (
                      <button
                        key={sec.id}
                        type="button"
                        className={
                          selectedSection === sec.id
                            ? "tcx-chip tcx-chip-active"
                            : "tcx-chip"
                        }
                        aria-pressed={selectedSection === sec.id}
                        onClick={() => setSelectedSection(sec.id)}
                      >
                        {sec.title}
                      </button>
                    ))}
                  </div>
                </Block>
                {selectedSection && selectedSection !== "header" ? (
                  <Block title="Order">
                    <div className="tcx-theme-row">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<ChevronUp size={14} />}
                        label="Move up"
                        onClick={() => {
                          const avail = sections
                            .filter((s) => s.id !== "header")
                            .map((s) => s.id);
                          const order = effectiveOrder(
                            settings?.sectionOrder,
                            avail,
                            { additionalSections: useStore.getState().additionalSections },
                          );
                          onSelect({
                            sectionOrder: moveInOrder(
                              order,
                              selectedSection,
                              "up",
                            ),
                          });
                        }}
                      />
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<ChevronDown size={14} />}
                        label="Move down"
                        onClick={() => {
                          const avail = sections
                            .filter((s) => s.id !== "header")
                            .map((s) => s.id);
                          const order = effectiveOrder(
                            settings?.sectionOrder,
                            avail,
                            { additionalSections: useStore.getState().additionalSections },
                          );
                          onSelect({
                            sectionOrder: moveInOrder(
                              order,
                              selectedSection,
                              "down",
                            ),
                          });
                        }}
                      />
                    </div>
                  </Block>
                ) : null}
                {isExtra(selectedSection) ? (
                  <Block title="Extra section">
                    <div className="tcx-theme-row">
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={<Copy size={14} />}
                        label="Duplicate"
                        onClick={() => {
                          useStore
                            .getState()
                            .duplicateAdditionalSection(
                              extraIdOf(selectedSection),
                            );
                        }}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={14} />}
                        label="Remove"
                        onClick={() => {
                          useStore
                            .getState()
                            .removeAdditionalSections({
                              id: extraIdOf(selectedSection),
                            });
                          setSelectedSection(sections[0]?.id || "header");
                        }}
                      />
                    </div>
                  </Block>
                ) : null}
                {isSidebar || isSplit ? (
                  selectedSection && selectedSection !== "header" ? (
                  <Seg
                    label={isSplit ? "Column" : "Placement"}
                    options={
                      isSplit
                        ? [
                            { id: "0", name: "Left" },
                            { id: "1", name: "Right" },
                          ]
                        : [
                            { id: "0", name: "Sidebar" },
                            { id: "1", name: "Main" },
                          ]
                    }
                    value={String(currentCol)}
                    cols={2}
                    onChange={(id) =>
                      setSectionColumn(selectedSection, Number(id))
                    }
                  />
                  ) : null
                ) : null}
                <Block title="Overrides">
                  <div className="tcx-ranges">
                    <RangeField
                      label="Font size"
                      value={selected.fontSize ?? baseFont}
                      min={11}
                      max={18}
                      step={1}
                      suffix="px"
                      onChange={(v) =>
                        patchSection(selectedSection, { fontSize: v })
                      }
                    />
                    <RangeField
                      label="Line height"
                      value={selected.lineHeight ?? baseLine}
                      min={1.1}
                      max={2}
                      step={0.05}
                      suffix=""
                      onChange={(v) =>
                        patchSection(selectedSection, { lineHeight: v })
                      }
                    />
                    <RangeField
                      label="Spacing before"
                      value={selected.gap ?? baseGap}
                      min={0}
                      max={28}
                      step={1}
                      suffix="px"
                      onChange={(v) =>
                        patchSection(selectedSection, { gap: v })
                      }
                    />
                    <RangeField
                      label="Margin top"
                      value={selected.marginTop ?? 0}
                      min={0}
                      max={48}
                      step={1}
                      suffix="px"
                      onChange={(v) =>
                        patchSection(selectedSection, { marginTop: v })
                      }
                    />
                    <RangeField
                      label="Margin bottom"
                      value={selected.marginBottom ?? 0}
                      min={0}
                      max={48}
                      step={1}
                      suffix="px"
                      onChange={(v) =>
                        patchSection(selectedSection, { marginBottom: v })
                      }
                    />
                    <RangeField
                      label="Heading scale"
                      value={selected.headingScale ?? 1}
                      min={0.7}
                      max={1.3}
                      step={0.05}
                      suffix="×"
                      onChange={(v) =>
                        patchSection(selectedSection, { headingScale: v })
                      }
                    />
                  </div>
                </Block>
                {sectionStyles[selectedSection] ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    width="100%"
                    label={`Reset “${
                      sections.find((s) => s.id === selectedSection)?.title ||
                      selectedSection
                    }”`}
                    onClick={() => clearSection(selectedSection)}
                  />
                ) : (
                  <p className="tcx-block-hint">
                    Using global typography — move a slider to override this
                    section.
                  </p>
                )}
              </>
            ) : (
              <p className="tcx-block-hint">
                Open customize from the editor to tune each section
                independently.
              </p>
            )}
          </div>
        ) : null}
      </div>

      {hasOverrides ? (
        <footer className="tcx-foot">
          <Button
            variant="ghost"
            size="sm"
            width="100%"
            label="Reset color & type overrides"
            onClick={resetCustomization}
          />
        </footer>
      ) : null}
    </aside>
  );
};

export default TemplateCustomize;
