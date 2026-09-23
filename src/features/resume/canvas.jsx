import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@astryxdesign/core/Button";
import { IconButton } from "@astryxdesign/core/IconButton";
import { VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
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
import { isSidebarLayout, isSplitLayout } from "./style";
import { SECTION_TITLES, moveWithinColumn, placeBefore } from "./order";
import "./canvas.css";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const PANEL_WIDTH = 248;
const PANEL_GAP = 6;
const PANEL_VIEW_MARGIN = 8;
const PANEL_MAX_HEIGHT = 560;

/** Merge a patch into one section's sectionStyles entry. */
const patchSection = (resumeSettings, setSettings, id, patch) => {
  const cur = resumeSettings?.sectionStyles || {};
  const next = { ...(cur[id] || {}), ...patch };
  for (const key of Object.keys(next)) {
    if (next[key] == null || Number.isNaN(Number(next[key]))) delete next[key];
  }
  setSettings({ sectionStyles: { ...cur, [id]: next } });
};

export const useResumeCanvas = ({ interactive, columnsOf, order, sections, onEditSection }) => {
  const resumeSettings = useStore((state) => state.resumeSettings);
  const [selectedId, setSelectedId] = useState(null);
  const [draftOrder, setDraftOrder] = useState(null);
  const [dragState, setDragState] = useState(null);
  const dragRef = useRef({ id: null, draft: null, rows: null, start: null, cols: null, startCols: null });

  const available = sections.map((entry) => entry.id);
  const displayOrder = draftOrder || order;
  const baseCols = resumeSettings?.sectionCols || {};

  useEffect(() => {
    if (selectedId && !available.includes(selectedId)) setSelectedId(null);
  }, [available.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => {
    document.body.classList.remove("rcs-dragging-global");
  }, []);

  const setSettings = (patch) =>
    useStore.getState().setResumeSettings(patch);

  const columnize = (ids, sc) => columnsOf(ids, sc || baseCols);

  const select = (id) => {
    if (!interactive) return;
    setSelectedId((current) => (current === id ? current : id));
  };
  const deselect = () => setSelectedId(null);

  const moveTo = (currentOrder, id, dir) => {
    const next = moveWithinColumn(columnize(currentOrder), id, dir);
    if (next.join() !== currentOrder.join()) setSettings({ sectionOrder: next });
  };
  const move = (id, dir) => moveTo(displayOrder, id, dir);

  /* ----- Drag & drop -----
     Live-reorder must not recompute targets from the LIVE DOM: every reorder
     relocates the sections under the pointer, so the next pointermove picks a
     different slot and the list oscillates (the "shaking" DOM). We snapshot
     each section's column (array index from the layout's columns function) and
     midpoint once at drag start and derive insertions from that frozen
     geometry, committing only when the slot actually changes.

     Cross-column moves (sidebar ↔ main) work off the same frozen rows: the
     pointer picks an insertion slot in whichever column it is hovering. The
     dragged section carries a transient column override (ref.cols) so the live
     preview re-renders it in the new column; on drop the override is persisted
     to resumeSettings.sectionCols so the placement survives reloads and the
     PDF export. */
  const rowsForGeometry = (start, startCols) => {
    const rows = new Map();
    const add = (el) => {
      const id = el.dataset && el.dataset.rsection;
      if (!id || id === "header") return;
      const rect = el.getBoundingClientRect();
      if (!rect || rect.height === 0) return;
      const col = startCols.findIndex((c) => c.includes(id));
      if (col < 0) return;
      if (!rows.has(col)) rows.set(col, []);
      rows.get(col).push({
        id,
        top: rect.top,
        bottom: rect.bottom,
        mid: rect.top + rect.height / 2,
      });
    };
    document.querySelectorAll("[data-rsection]").forEach(add);
    for (const col of rows.values()) col.sort((a, b) => a.top - b.top);
    return rows;
  };

  // The columns the paper renders this frame — persisted overrides, plus a
  // transient override while dragging so the moved section visibly travels to
  // the column it is heading for before the drop is committed.
  const displayCols = dragRef.current?.cols || baseCols;

  const startDrag = (id, event) => {
    if (!interactive) return;
    event.preventDefault();
    const start = resumeSettings?.sectionOrder?.length
      ? [...resumeSettings.sectionOrder]
      : [...order];
    const startCols = columnize(start, baseCols);
    dragRef.current = {
      id,
      draft: start,
      start,
      startCols,
      cols: { ...baseCols, [id]: startCols.findIndex((c) => c.includes(id)) },
      rows: rowsForGeometry(start, startCols),
    };
    setDragState({ id, over: null });
    setDraftOrder(start);
    document.body.classList.add("rcs-dragging-global");
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (event) => {
    const ref = dragRef.current;
    if (!ref || !ref.rows || !ref.startCols) return;
    const { id, draft, rows, startCols } = ref;
    const el = document.elementFromPoint(event.clientX, event.clientY);
    const host = el && el.closest ? el.closest("[data-rsection]") : null;
    // Never target the section being dragged, the header or the page gutter.
    if (!host || host.dataset.rsection === id) return;
    const col = startCols.findIndex((c) => c.includes(host.dataset.rsection));
    if (col < 0) return;
    const list = rows.get(col);
    if (!list) return;

    // Insertion slot from the frozen column geometry. The dragged section is
    // the only row excluded, so counting rows whose block is below the pointer
    // yields the drop index regardless of the live DOM moving underneath us.
    const others = list.filter((row) => row.id !== id);
    if (others.length === 0) return;
    const y = event.clientY;
    let index = others.findIndex((row) => row.bottom > y);
    if (index === -1) index = others.length;

    const cols = columnize(draft, ref.cols);
    let next;
    if (index === 0) {
      next = placeBefore(cols, id, others[0].id, false);
    } else if (index >= others.length) {
      next = placeBefore(cols, id, others[others.length - 1].id, true);
    } else {
      // Snap to the nearer boundary so small jitters don't toggle direction.
      const prevBottom = others[index - 1].bottom;
      const nextTop = others[index].top;
      next =
        y < (prevBottom + nextTop) / 2
          ? placeBefore(cols, id, others[index].id, false)
          : placeBefore(cols, id, others[index - 1].id, true);
    }
    if (next.join() === draft.join()) return;
    // Track the section's new column in the transient override so subsequent
    // moves within that column are computed against the right stack.
    if (ref.cols[id] !== col) {
      dragRef.current.cols = { ...ref.cols, [id]: col };
    }
    dragRef.current.draft = next;
    setDraftOrder(next);
    setDragState({
      id,
      over: index === 0 ? others[0].id : others[Math.min(index, others.length) - 1].id,
    });
  };

  const onPointerUp = () => {
    const ref = dragRef.current;
    if (ref?.draft && ref.draft.join() !== ref.start.join()) {
      const patch = { sectionOrder: ref.draft };
      if (ref.startCols?.length) {
        const finalCols = columnize(ref.draft, ref.cols);
        const finalIdx = finalCols.findIndex((c) => c.includes(ref.id));
        const defaultIdx = ref.startCols.findIndex((c) => c.includes(ref.id));
        if (finalIdx >= 0 && finalIdx !== defaultIdx) {
          patch.sectionCols = { ...baseCols, [ref.id]: finalIdx };
        }
      }
      setSettings(patch);
    }
    dragRef.current = { id: null, draft: null, rows: null, start: null, cols: null, startCols: null };
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
    displayCols,
    canMoveUp: (id) => {
      const col = columnize(displayOrder).find((c) => c.includes(id));
      return !!col && col.indexOf(id) > 0;
    },
    canMoveDown: (id) => {
      const col = columnize(displayOrder).find((c) => c.includes(id));
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

const AppearancePanel = ({ canvas, sectionId, sectionTitle, onClose, anchorRef }) => {
  const settings = canvas.resumeSettings;
  const set = (patch) => canvas.setSettings(patch);
  const sec = settings?.sectionStyles?.[sectionId] || {};
  const baseFont = settings.fontSize ?? 14;
  const baseLine = settings.lineHeight ?? 1.5;
  const baseGap = settings.sectionSpacing ?? 16;
  const hasSectionOverrides = Object.keys(sec).length > 0;
  const hasGlobalOverrides =
    settings.primaryColor || settings.bgColor || settings.textColor;
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const patchSec = (patch) =>
    patchSection(settings, set, sectionId, patch);
  const clearSec = () => {
    const next = { ...(settings?.sectionStyles || {}) };
    delete next[sectionId];
    set({ sectionStyles: next });
  };

  // Portal + fixed position so the panel escapes .editor-preview-pane overflow
  // clipping (common for lower sections in left-sidebar templates).
  useLayoutEffect(() => {
    const panel = panelRef.current;
    const anchor = anchorRef?.current;
    if (!panel || !anchor) return;

    const place = () => {
      const rect = anchor.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const maxH = Math.min(vh * 0.62, PANEL_MAX_HEIGHT);
      const spaceBelow = vh - rect.bottom - PANEL_VIEW_MARGIN;
      const spaceAbove = rect.top - PANEL_VIEW_MARGIN;
      const flip =
        spaceBelow < Math.min(maxH, 280) && spaceAbove > spaceBelow;
      const available = Math.max(120, flip ? spaceAbove : spaceBelow);
      const height = Math.min(maxH, available);

      let left = rect.right - PANEL_WIDTH;
      left = Math.max(
        PANEL_VIEW_MARGIN,
        Math.min(left, vw - PANEL_WIDTH - PANEL_VIEW_MARGIN),
      );

      panel.style.width = `${PANEL_WIDTH}px`;
      panel.style.maxHeight = `${height}px`;
      panel.style.left = `${left}px`;
      panel.style.right = "auto";
      if (flip) {
        panel.style.top = `${rect.top - PANEL_GAP}px`;
        panel.style.transform = "translateY(-100%)";
        panel.dataset.placement = "above";
      } else {
        panel.style.top = `${rect.bottom + PANEL_GAP}px`;
        panel.style.transform = "";
        panel.dataset.placement = "below";
      }
    };

    place();

    const pane = anchor.closest(".editor-preview-pane");
    window.addEventListener("resize", place);
    pane?.addEventListener("scroll", place, { passive: true });

    const onPointerDown = (event) => {
      const target = event.target;
      if (panel.contains(target) || anchor.contains(target)) return;
      onCloseRef.current();
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("resize", place);
      pane?.removeEventListener("scroll", place);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef]);

  const panel = (
    <div
      ref={panelRef}
      className="rcs-panel rcs-panel-appearance rcs-panel-portal"
      role="dialog"
      aria-label={`${sectionTitle} appearance`}
    >
      <VStack gap={2} width="100%">
        <Text type="inherit" size="sm" weight="semibold" color="primary">
          This section · {sectionTitle}
        </Text>
        <Stepper
          label="Font size"
          value={sec.fontSize ?? baseFont}
          min={11}
          max={18}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => patchSec({ fontSize: clamp((sec.fontSize ?? baseFont) - 1, 11, 18) })}
          onIncrement={() => patchSec({ fontSize: clamp((sec.fontSize ?? baseFont) + 1, 11, 18) })}
        />
        <Stepper
          label="Line height"
          value={sec.lineHeight ?? baseLine}
          min={1.1}
          max={2}
          step={0.05}
          format={(v) => v.toFixed(2)}
          onDecrement={() => patchSec({ lineHeight: clamp((sec.lineHeight ?? baseLine) - 0.05, 1.1, 2) })}
          onIncrement={() => patchSec({ lineHeight: clamp((sec.lineHeight ?? baseLine) + 0.05, 1.1, 2) })}
        />
        <Stepper
          label="Spacing before"
          value={sec.gap ?? baseGap}
          min={0}
          max={28}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => patchSec({ gap: clamp((sec.gap ?? baseGap) - 1, 0, 28) })}
          onIncrement={() => patchSec({ gap: clamp((sec.gap ?? baseGap) + 1, 0, 28) })}
        />
        <Stepper
          label="Margin top"
          value={sec.marginTop ?? 0}
          min={0}
          max={48}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => patchSec({ marginTop: clamp((sec.marginTop ?? 0) - 1, 0, 48) })}
          onIncrement={() => patchSec({ marginTop: clamp((sec.marginTop ?? 0) + 1, 0, 48) })}
        />
        <Stepper
          label="Margin bottom"
          value={sec.marginBottom ?? 0}
          min={0}
          max={48}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => patchSec({ marginBottom: clamp((sec.marginBottom ?? 0) - 1, 0, 48) })}
          onIncrement={() => patchSec({ marginBottom: clamp((sec.marginBottom ?? 0) + 1, 0, 48) })}
        />
        <Stepper
          label="Heading scale"
          value={sec.headingScale ?? 1}
          min={0.7}
          max={1.3}
          step={0.05}
          format={(v) => `${v.toFixed(2)}×`}
          onDecrement={() => patchSec({ headingScale: clamp((sec.headingScale ?? 1) - 0.05, 0.7, 1.3) })}
          onIncrement={() => patchSec({ headingScale: clamp((sec.headingScale ?? 1) + 0.05, 0.7, 1.3) })}
        />
        {hasSectionOverrides && (
          <Button
            variant="ghost"
            size="sm"
            width="100%"
            icon={<RotateCcw size={13} />}
            label={`Reset "${sectionTitle}" section`}
            onClick={clearSec}
          />
        )}
        <Divider orientation="horizontal" />
        <Text type="inherit" size="sm" weight="semibold" color="primary">
          Whole resume
        </Text>
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
        <Stepper
          label="Page padding"
          value={settings.pagePadX ?? 26}
          min={10}
          max={60}
          step={1}
          format={(v) => `${Math.round(v)}px`}
          onDecrement={() => { const v = clamp((settings.pagePadX ?? 26) - 1, 10, 60); set({ pagePadX: v, pagePadY: v }); }}
          onIncrement={() => { const v = clamp((settings.pagePadX ?? 26) + 1, 10, 60); set({ pagePadX: v, pagePadY: v }); }}
        />
        {isSidebarLayout(settings) && (
          <>
            <Stepper
              label="Sidebar width"
              value={settings.sidebarWidth ?? 32}
              min={20}
              max={46}
              step={1}
              format={(v) => `${Math.round(v)}%`}
              onDecrement={() => set({ sidebarWidth: clamp((settings.sidebarWidth ?? 32) - 1, 20, 46) })}
              onIncrement={() => set({ sidebarWidth: clamp((settings.sidebarWidth ?? 32) + 1, 20, 46) })}
            />
            <Stepper
              label="Sidebar gap"
              value={settings.colGap ?? 24}
              min={0}
              max={48}
              step={1}
              format={(v) => `${Math.round(v)}px`}
              onDecrement={() => set({ colGap: clamp((settings.colGap ?? 24) - 1, 0, 48) })}
              onIncrement={() => set({ colGap: clamp((settings.colGap ?? 24) + 1, 0, 48) })}
            />
          </>
        )}
        {isSplitLayout(settings) && (
          <Stepper
            label="Column gap"
            value={settings.colGap ?? 24}
            min={4}
            max={48}
            step={1}
            format={(v) => `${Math.round(v)}px`}
            onDecrement={() => set({ colGap: clamp((settings.colGap ?? 24) - 1, 4, 48) })}
            onIncrement={() => set({ colGap: clamp((settings.colGap ?? 24) + 1, 4, 48) })}
          />
        )}
        <Divider orientation="horizontal" />
        <div className="rcs-palette-row" aria-label="Accent colors">
          {RESUME_PALETTES.map((palette) => {
            const active =
              (!settings.primaryColor && settings.paletteId === palette.id) ||
              settings.primaryColor === palette.accent;
            return (
              <button
                type="button"
                key={palette.id}
                className={active ? "rcs-swatch rcs-swatch-active" : "rcs-swatch"}
                title={palette.name}
                aria-label={`Accent ${palette.name}`}
                aria-pressed={active}
                onClick={() => set({ paletteId: palette.id, primaryColor: "" })}
                style={{ background: palette.accent }}
              >
                <span className="rcs-swatch-ring" />
              </button>
            );
          })}
        </div>
        <ColorControl
          label="Accent"
          value={
            settings.primaryColor ||
            RESUME_PALETTES.find((p) => p.id === settings.paletteId)?.accent ||
            ""
          }
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
        {(hasGlobalOverrides || Object.keys(settings?.sectionStyles || {}).length > 0) && (
          <Button
            variant="ghost"
            size="sm"
            width="100%"
            icon={<RotateCcw size={13} />}
            label="Clear colors & spacing"
            onClick={() =>
              set({ primaryColor: "", bgColor: "", textColor: "", fontSize: 14, lineHeight: 1.5, sectionSpacing: 16, pagePadX: 26, pagePadY: 30, colGap: 24, nameSize: 27, photoSize: 72, radiusSm: 4, sidebarWidth: 32, sectionStyles: {} })
            }
          />
        )}
        <Button variant="secondary" size="sm" width="100%" label="Done" onClick={onClose} />
      </VStack>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(panel, document.body);
};

export const SectionShell = ({ id, title, node, kind = "section", canvas }) => {
  const [panelOpen, setPanelOpen] = useState(false);
  const toolbarRef = useRef(null);
  const interactive = Boolean(canvas?.interactive);
  const selected = interactive && canvas.selectedId === id;
  const dragging = interactive && canvas.dragState?.id === id;
  const dropTarget = interactive && canvas.dragState?.over === id;
  const isHeader = kind === "header";

  useEffect(() => {
    if (!selected) setPanelOpen(false);
  }, [selected]);

  if (!interactive) return node;

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
          ref={toolbarRef}
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
            value={
              canvas.resumeSettings.sectionStyles?.[id]?.fontSize ??
              canvas.resumeSettings.fontSize ??
              14
            }
            min={11}
            max={18}
            step={1}
            format={(v) => `${Math.round(v)}`}
            onDecrement={() =>
              patchSection(
                canvas.resumeSettings,
                canvas.setSettings,
                id,
                {
                  fontSize: clamp(
                    (canvas.resumeSettings.sectionStyles?.[id]?.fontSize ??
                      canvas.resumeSettings.fontSize ??
                      14) - 1,
                    11,
                    18,
                  ),
                },
              )
            }
            onIncrement={() =>
              patchSection(
                canvas.resumeSettings,
                canvas.setSettings,
                id,
                {
                  fontSize: clamp(
                    (canvas.resumeSettings.sectionStyles?.[id]?.fontSize ??
                      canvas.resumeSettings.fontSize ??
                      14) + 1,
                    11,
                    18,
                  ),
                },
              )
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
          {panelOpen && (
            <AppearancePanel
              canvas={canvas}
              sectionId={id}
              sectionTitle={title || SECTION_TITLES[id] || id}
              anchorRef={toolbarRef}
              onClose={() => setPanelOpen(false)}
            />
          )}
        </div>
      )}
    </div>
  );
};