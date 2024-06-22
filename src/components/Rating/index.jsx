import React, { useMemo } from "react";
import { useClasses, useTheme } from "@geist-ui/core";
import { Star } from "@geist-ui/icons";

import "./styles.css";

const getColor = (type, palette) => {
  const colors = {
    default: palette.foreground,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
  };
  return colors[type] || colors.default;
};

export const Rating = ({
  type,
  className,
  icon = <Star />,
  count = 5,
  value,
  onValueChange,
  ...props
}) => {
  const theme = useTheme();
  const color = useMemo(
    () => getColor(type, theme.palette),
    [type, theme.palette]
  );

  return (
    <div
      style={{ "--rating-icon-color": color }}
      className={useClasses("rating", color, className)}
      {...props}
    >
      {[...Array(count)].map((_, index) => (
        <div
          className={useClasses("icon-box", {
            hovered: index + 1 <= value,
          })}
          key={index}
          onClick={() => onValueChange(index + 1)}
        >
          {icon}
        </div>
      ))}
    </div>
  );
};
