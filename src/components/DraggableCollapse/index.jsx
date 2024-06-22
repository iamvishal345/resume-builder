import React, { useEffect, useRef } from "react";
import Expand from "@geist-ui/core/esm/shared/expand";
import { useScale, useTheme } from "@geist-ui/core";
import { ChevronDown } from "@geist-ui/icons";
import Sortable from "sortablejs";

import "./styles.css";

export const Collapse = ({
  title,
  subtitle,
  visible,
  clickHandler,
  children,
}) => {
  return (
    <div className="collapse shadow">
      <div className="title">
        {title}
        <ChevronDown
          className={`collapse-icon ${visible ? "active" : ""}`}
          role="button"
          onClick={clickHandler}
        />
      </div>
      {subtitle && <div className="subtitle">{subtitle}</div>}
      <Expand isExpanded={visible}>{children}</Expand>
    </div>
  );
};

export const DraggableCollapse = ({ children, onDrag }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    Sortable.create(containerRef.current, {
      handle: ".drag-button",
      animation: 150,
      onUpdate: (e) => {
        onDrag(e.oldIndex, e.newIndex);
      },
    });
  }, []);
  return (
    <div ref={containerRef} className="collapse-group">
      {children}
    </div>
  );
};
