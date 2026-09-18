import React, { useEffect, useRef } from "react";
import Sortable from "sortablejs";
import { Card } from "@astryxdesign/core/Card";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { ChevronDown, GripVertical, Trash2 } from "lucide-react";

import "./styles.css";

export const Collapse = ({
  title,
  subtitle,
  visible,
  clickHandler,
  onDelete,
  children,
}) => {
  return (
    <Card padding={2} variant="default">
      <VStack gap={2} width="100%">
        <HStack align="center" gap={2} width="100%">
          <IconButton
            label="Drag"
            tooltip="Drag to reorder"
            variant="ghost"
            className="drag-button"
            icon={<GripVertical size={15} />}
            onClick={(e) => e.stopPropagation()}
          />
          <VStack gap={0} align="start" width="100%" onClick={clickHandler}>
            <Text type="inherit" size="md" weight="semibold" color="primary">
              {title}
            </Text>
            {subtitle && (
              <Text type="inherit" size="sm" color="secondary">
                {subtitle}
              </Text>
            )}
          </VStack>
          <IconButton
            label="Delete"
            tooltip="Delete"
            variant="ghost"
            icon={<Trash2 size={16} />}
            onClick={onDelete}
          />
          <IconButton
            label={visible ? "Collapse" : "Expand"}
            tooltip={visible ? "Collapse section" : "Expand section"}
            variant="ghost"
            icon={
              <ChevronDown
                className={`collapse-icon ${visible ? "active" : ""}`}
              />
            }
            onClick={clickHandler}
          />
        </HStack>
        {visible && <div className="collapse-content">{children}</div>}
      </VStack>
    </Card>
  );
};

/** Always-open sortable list (skills and similar flat rows). */
export const DraggableList = ({ children, onDrag, gap = 2 }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const sortable = Sortable.create(containerRef.current, {
      handle: ".drag-button",
      animation: 150,
      onUpdate: (e) => {
        onDrag(e.oldIndex, e.newIndex);
      },
    });
    return () => sortable.destroy();
  }, [onDrag]);
  return (
    <div ref={containerRef} className="draggable-list" style={{ display: "flex", flexDirection: "column", gap: `var(--spacing-${gap})`, width: "100%" }}>
      {children}
    </div>
  );
};

export const DraggableCollapse = ({ children, onDrag }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (!containerRef.current) return undefined;
    const sortable = Sortable.create(containerRef.current, {
      handle: ".drag-button",
      animation: 150,
      onUpdate: (e) => {
        onDrag(e.oldIndex, e.newIndex);
      },
    });
    return () => sortable.destroy();
  }, [onDrag]);
  return (
    <div
      ref={containerRef}
      className="draggable-collapse"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-3)",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
};
