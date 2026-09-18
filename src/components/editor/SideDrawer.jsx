import { useEffect, useId, useRef } from "react";
import { IconButton } from "@astryxdesign/core/IconButton";
import { HStack, VStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { X } from "lucide-react";

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const SideDrawer = ({ isOpen, onOpenChange, title, subtitle, children }) => {
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    previouslyFocused.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? [...panel.querySelectorAll(FOCUSABLE)].filter(
            (el) => el instanceof HTMLElement && !el.hasAttribute("disabled"),
          )
        : [];

    // Defer so drawer content (and close button) are in the DOM.
    const focusTimer = window.setTimeout(() => {
      const items = focusables();
      (items[0] || panel)?.focus?.();
    }, 0);

    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        event.preventDefault();
        panel?.focus?.();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      const prior = previouslyFocused.current;
      if (prior && typeof prior.focus === "function") {
        prior.focus();
      }
    };
  }, [isOpen, onOpenChange]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="side-drawer-overlay"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className="side-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <HStack
          justify="between"
          align="start"
          gap={3}
          className="side-drawer-head"
        >
          <VStack gap={0}>
            <span id={titleId}>
              <Text type="inherit" size="xl" weight="semibold" color="primary">
                {title}
              </Text>
            </span>
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
