import React, { useEffect } from "react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { X } from "lucide-react";

const SideDrawer = ({ isOpen, onOpenChange, title, subtitle, children }) => {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <>
      <div className="side-drawer-overlay" onClick={() => onOpenChange(false)} />
      <aside
        className="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <HStack justify="between" align="start" gap={3} className="side-drawer-head">
          <VStack gap={0}>
            <Text type="inherit" size="xl" weight="semibold" color="primary">
              {title}
            </Text>
            {subtitle && (
              <Text type="inherit" size="md" color="secondary">
                {subtitle}
              </Text>
            )}
          </VStack>
          <IconButton
            label="Close"
            tooltip="Close"
            variant="ghost"
            icon={<X size={18} />}
            onClick={() => onOpenChange(false)}
          />
        </HStack>
        <div className="side-drawer-body">{children}</div>
      </aside>
    </>
  );
};

export default SideDrawer;