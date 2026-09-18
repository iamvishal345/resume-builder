import { useEffect, useMemo, useRef, useState } from "react";
import { VStack, HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";

/**
 * Desktop command palette (⌘K / Ctrl+K).
 * actions: [{ id, label, hint?, run, keywords? }]
 */
const CommandPalette = ({ open, onOpenChange, actions = [] }) => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => {
      const hay = `${a.label} ${a.hint || ""} ${a.keywords || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [actions, query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  if (!open) return null;

  const run = (action) => {
    onOpenChange(false);
    action?.run?.();
  };

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onOpenChange(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) run(filtered[active]);
    }
  };

  return (
    <div
      className="cmd-palette-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="cmd-palette"
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        onKeyDown={onKeyDown}
      >
        <input
          ref={inputRef}
          className="cmd-palette-input"
          placeholder="Jump to step, export, check…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-autocomplete="list"
        />
        <VStack gap={0} width="100%" className="cmd-palette-list">
          {filtered.length === 0 ? (
            <Text type="inherit" size="sm" color="secondary">
              No matching actions
            </Text>
          ) : (
            filtered.map((action, index) => (
              <button
                key={action.id}
                type="button"
                className={
                  index === active
                    ? "cmd-palette-item cmd-palette-item-active"
                    : "cmd-palette-item"
                }
                onMouseEnter={() => setActive(index)}
                onClick={() => run(action)}
              >
                <HStack justify="between" align="center" width="100%">
                  <span>{action.label}</span>
                  {action.hint ? (
                    <span className="cmd-palette-hint">{action.hint}</span>
                  ) : null}
                </HStack>
              </button>
            ))
          )}
        </VStack>
      </div>
    </div>
  );
};

export default CommandPalette;
