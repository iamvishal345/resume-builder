import React, { useMemo } from "react";
import { Icon } from "@astryxdesign/core/Icon";
import { Star } from "lucide-react";

import "./styles.css";

const getColor = (type) => {
  const colors = {
    default: "inherit",
    success: "success",
    warning: "warning",
    error: "error",
  };
  return colors[type] || colors.default;
};

export const Rating = ({
  type = "default",
  className,
  icon = Star,
  count = 5,
  value,
  onValueChange,
  ...props
}) => {
  const color = useMemo(() => getColor(type), [type]);

  return (
    <div className={`rating ${className || ""}`} {...props}>
      {[...Array(count)].map((_, index) => (
        <div
          className={`icon-box${index + 1 <= value ? " hovered" : ""}`}
          key={index}
          onClick={() => onValueChange(index + 1)}
        >
          <Icon icon={icon} color={color} size="md" />
        </div>
      ))}
    </div>
  );
};