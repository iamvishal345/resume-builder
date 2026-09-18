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
  value = 0,
  onValueChange,
  ...props
}) => {
  const color = useMemo(() => getColor(type), [type]);
  const level = Number(value) || 0;

  return (
    <div
      className={`rating ${className || ""}`}
      data-type={type}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={level}
      {...props}
    >
      {Array.from({ length: count }, (_, index) => (
        <button
          type="button"
          className={`icon-box${index + 1 <= level ? " hovered" : ""}`}
          key={index}
          aria-label={`Level ${index + 1}`}
          onClick={() => onValueChange?.(index + 1)}
        >
          <Icon icon={icon} color={color} size="md" />
        </button>
      ))}
    </div>
  );
};