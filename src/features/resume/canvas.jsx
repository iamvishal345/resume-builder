import React, { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { VStack } from "@astryxdesign/core/Layout";
import { Divider } from "@astryxdesign/core/Divider";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Minus,
  Plus,
  Palette,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { useStore } from "@store";
import { RESUME_PALETTES } from "./palettes";
import { SECTION_TITLES, moveWithinColumn, placeBefore } from "./order";
import "./canvas.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const useResumeCanvas = ({ interactive, columnsOf, order, sections, onEditSection }) => {
  const resumeSettings = useStore((state) => state.resumeSettings);
  const [selectedId, setSelectedId] = useState(null);
  const [draftOrder, setDraftOrder] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef({ id: null, draft: null });

  const available = sections.map((entry) => entry.id);
  const displayOrder = draftOrder || order;

  useEffect(() => {
    if (selectedId && !available.includes(selectedId)) setSelectedId(null);
  }, [available.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    document.body.classList.remove("rcs-dragging-global");
  }, []);

  const setSettings = (patch) =>
    useStore.getState().setResumeSettings(patch);

  const columnsFor = (ids) => columnsOf(ids);

  const select = (id) => {
    if (!interactive) return;
    setSelectedId((current) => (current === id ? current : id));
  };
  const deselect = () => setSelectedId(null);

  const moveTo = (currentOrder, id, dir) => {
    const next = moveWithinColumn(columnsFor(currentOrder), id, dir);
    if (next.join() !== currentOrder.join()) setSettings({ sectionOrder: next });
  };
  const move = (id, dir) => moveTo(displayOrder, id, dir);

  const startDrag = (id, event) => {
    if (!interactive) return;
    event.preventDefault();
    dragRef.current = { id, draft: resumeSettings?.sectionOrder?.length ? [...resumeSettings.sectionOrder] : [...order] };
    setDragState({ id, over: null });
    setDraftOrder(dragRef.current.draft);
    document.body.classList.add("rcs-dragging-global");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (event) => {
    const { id, draft } = dragRef.current;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const target = el && el.closest ? el.closest("[data-rsection]") : null;
    const targetId = target && target.dataset.rsection;
    if (!targetId || targetId === id) return;
    const cols = columnsFor(draft);
    const movingCol = cols.find((col) => col.includes(id));
    const targetCol = cols.find((col) => col.includes(targetId));
    if (!movingCol || movingCol !== targetCol) return;
    const after = movingCol.indexOf(id) < movingCol.indexOf(targetId);
    const next = placeBefore(cols, id, targetId, after);
    dragRef.current.draft = next;
    setDraftOrder(next);
    setDragState({ id, over: targetId });
  };

  const onPointerUp = () => {
    const { draft } = dragRef.current;
    if (draft) setSettings({ sectionOrder: draft });
    dragRef.current = { id: null, draft: null };
    setDraftOrder(null);
    setDragState(null);
    document.body.classList.remove("rcs-dragging-global");
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  return {
    interactive: !!interactive,
    resumeSettings,
    setSettings,
    selectedId,
    select,
    deselect,
    move,
    startDrag,
    dragState,
    displayOrder,
    canMoveUp: (id) => {
      const col = columnsOf(displayOrder).find((c) => c.includes(id));
      return !!col && col.indexOf(id) > 0;
    },
    canMoveDown: (id) => {
      const col = columnsOf(displayOrder).find((c) => c.includes(id));
      return !!col && col.indexOf(id) < col.length - 1;
    },
    onEditSection,
  };
};

const Stepper = ({ value, min, max, step, format, onDecrement, onIncrement, label }) => (
  <div className="rcs-stepper" aria-label={label}>
    <IconButton
      size="sm"
      variant="ghost"
      label={`Decrease ${label}`}
      tooltip={`Decrease ${label}`}
      className="rcs-icon"
      icon={<Minus size={13} />}
      isDisabled={value <= min}
      onClick={onDecrement}
    />
    <span className="rcs-stepper-value">{format(value)}</span>
    <IconButton
      size="sm"
      variant="ghost"
      label={`Increase ${label}`}
      tooltip={`Increase ${label}`}
      className="rcs-icon"
      icon={<Plus size={13} />}
      isDisabled={value >= max}
      onClick={onIncrement}
    />
  </div>
);

const ColorControl = ({ label, value, defaultHint, onChange }) => (
  <label className="rcs-color-row">
    <span className="rcs-color-label">{label}</span>
    <span className="rcs-color-input-wrap">
      <input
        type="color"
        value={defaultHint || value || "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="rcs-color-input"
        aria-label={`${label} color`}
      />
      <span className="rcs-color-hex">
        {value || defaultHint || "default"}
      </span>
    </span>
  </label>
);

const AppearancePanel = ({ canvas, onClose }) => {
  const settings = canvas.resumeSettings;
  const set = (patch) => canvas.setSettings(patch);
  const hasOverrides =
    settings.primaryColor || settings.bgColor || settings.textColor;

  return (
    <div className="rcs-panel rcs-panel-appearance" role="dialog" aria-label="Appearance">
      <VStack gap={2} width="100%">
        <Stepper
          label="Font size"
          value={settings.fontSize ?? 14}
          min={11}
          max={18}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => set({ fontSize: clamp((settings.fontSize ?? 14) - 1, 11, 18) })}
          onIncrement={() => set({ fontSize: clamp((settings.fontSize ?? 14) + 1, 11, 18) })}
        />
        <Stepper
          label="Line height"
          value={settings.lineHeight ?? 1.5}
          min={1.15}
          max={1.9}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onDecrement={() => set({ lineHeight: clamp((settings.lineHeight ?? 1.5) - 0.05, 1.15, 1.9) })}
          onIncrement={() => set({ lineHeight: clamp((settings.lineHeight ?? 1.5) + 0.05, 1.15, 1.9) })}
        />
        <Stepper
          label="Section spacing"
          value={settings.sectionSpacing ?? 16}
          min={8}
          max={28}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => set({ sectionSpacing: clamp((settings.sectionSpacing ?? 16) - 1, 8, 28) })}
          onIncrement={() => set({ sectionSpacing: clamp((settings.sectionSpacing ?? 16) + 1, 8, 28) })}
        />
        <Divider orientation="horizontal" />
        <div className="rcs-palette-row" aria-label="Accent colors">
          {RESUME_PALETTES.map((palette) => (
            <button
              type="button"
              key={palette.id}
              className="rcs-swatch"
              title={palette.name}
              aria-label={`Accent ${palette.name}`}
              onClick={() => set({ primaryColor: palette.accent })}
              style={{ background: palette.accent }}
            >
              <span className="rcs-swatch-ring" />
            </button>
          ))}
        </div>
        <ColorControl
          label="Accent"
          value={settings.primaryColor}
          defaultHint={null}
          onChange={(c) => set({ primaryColor: c })}
        />
        <ColorControl
          label="Background"
          value={settings.bgColor}
          onChange={(c) => set({ bgColor: c })}
        />
        <ColorControl
          label="Text"
          value={settings.textColor}
          onChange={(c) => set({ textColor: c })}
        />
        {hasOverrides && (
          <Button
            variant="ghost"
            size="sm"
            width="100%"
            icon={<RotateCcw size={13} />}
            label="Clear colors & spacing"
            onClick={() =>
              set({ primaryColor: "", bgColor: "", textColor: "", fontSize: 14, lineHeight: 1.5, sectionSpacing: 16 })
            }
          />
        )}
        <Button variant="secondary" size="sm" width="100%" label="Done" onClick={onClose} />
      </VStack>
    </div>
  );
};

export const SectionShell = ({ id, title, node, kind = "section", canvas }) => {
  if (!canvas || !canvas.interactive) return node;

  const [panelOpen, setPanelOpen] = useState(false);
  const selected = canvas.selectedId === id;
  const dragging = canvas.dragState?.id === id;
  const dropTarget = canvas.dragState?.over === id;
  const isHeader = kind === "header";

  return (
    <div
      className={[
        "rcs-section",
        selected ? "rcs-section-selected" : "",
        dragging ? "rcs-section-dragging" : "",
        dropTarget ? "rcs-section-drop-target" : "",
        isHeader ? "rcs-section-header" : "",
      ].filter(Boolean).join(" ")}
      data-rsection={id}
      data-rsection-title={title || SECTION_TITLES[id] || id}
      onClick={(event) => {
        if (event.target.closest(".rcs-toolbar, .rcs-panel")) return;
        canvas.select(id);
      }}
    >
      {node}
      {selected && (
        <div
          className="rcs-toolbar"
          role="toolbar"
          aria-label={`${title || id} controls`}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {!isHeader && (
            <>
              <IconButton
                size="sm"
                variant="ghost"
                label="Drag to reorder"
                tooltip="Drag to reorder"
                className="rcs-icon rcs-grip"
                icon={<GripVertical size={13} />}
                onPointerDown={(e) => canvas.startDrag(id, e)}
              />
              <IconButton
                size="sm"
                variant="ghost"
                label="Move up"
                tooltip="Move up"
                className="rcs-icon"
                icon={<ArrowUp size={13} />}
                isDisabled={!canvas.canMoveUp(id)}
                onClick={() => canvas.move(id, "up")}
              />
              <IconButton
                size="sm"
                variant="ghost"
                label="Move down"
                tooltip="Move down"
                className="rcs-icon"
                icon={<ArrowDown size={13} />}
                isDisabled={!canvas.canMoveDown(id)}
                onClick={() => canvas.move(id, "down")}
              />
              <Divider orientation="vertical" className="rcs-divider" />
            </>
          )}
          <Stepper
            label="Font size"
            value={canvas.resumeSettings.fontSize ?? 14}
            min={11}
            max={18}
            step={1}
            format={(v) => `${Math.round(v)}`}
            onDecrement={() =>
              canvas.setSettings({ fontSize: clamp((canvas.resumeSettings.fontSize ?? 14) - 1, 11, 18) })
            }
            onIncrement={() =>
              canvas.setSettings({ fontSize: clamp((canvas.resumeSettings.fontSize ?? 14) + 1, 11, 18) })
            }
          />
          <IconButton
            size="sm"
            variant="ghost"
            label="Colors & spacing"
            tooltip="Colors & spacing"
            className="rcs-icon"
            icon={<Palette size={13} />}
            onClick={() => setPanelOpen((open) => !open)}
          />
          <Divider orientation="vertical" className="rcs-divider" />
          {canvas.onEditSection && (
            <IconButton
              size="sm"
              variant="ghost"
              label="Edit this section"
              tooltip="Edit this section"
              className="rcs-icon"
              icon={<Pencil size={13} />}
              onClick={() => canvas.onEditSection(id)}
            />
          )}
          {panelOpen && <AppearancePanel canvas={canvas} onClose={() => setPanelOpen(false)} />}
        </div>
      )}
    </div>
  );
};