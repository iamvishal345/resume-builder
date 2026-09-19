import { useEffect, useRef, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { RefreshCw } from "lucide-react";
import { registerSW } from "virtual:pwa-register";

const RELOAD_GUARD = "cavren-sw-update-reload";

/**
 * WhatsApp Web–style update snackbar: persistent bottom toast with Reload.
 * Activates the waiting service worker via updateSW(true) — never a bare reload.
 */
export default function PwaUpdateToast() {
  const [visible, setVisible] = useState(false);
  const updateSWRef = useRef(null);
  const shownRef = useRef(false);

  useEffect(() => {
    let updateSW = () => Promise.resolve();

    updateSW = registerSW({
      immediate: true,
      onRegisteredSW(_swUrl, registration) {
        if (!registration) return;
        if (!registration.waiting) {
          try {
            sessionStorage.removeItem(RELOAD_GUARD);
          } catch {
            /* private mode */
          }
        }
        setInterval(
          () => {
            registration.update().catch(() => {});
          },
          60 * 60 * 1000,
        );
      },
      onNeedRefresh() {
        try {
          if (sessionStorage.getItem(RELOAD_GUARD) === "1") return;
        } catch {
          /* private mode */
        }
        if (shownRef.current) return;
        shownRef.current = true;
        updateSWRef.current = updateSW;
        setVisible(true);
      },
      onOfflineReady() {
        try {
          sessionStorage.removeItem(RELOAD_GUARD);
        } catch {
          /* private mode */
        }
      },
    });

    updateSWRef.current = updateSW;
  }, []);

  const dismiss = () => setVisible(false);

  const reload = () => {
    try {
      sessionStorage.setItem(RELOAD_GUARD, "1");
    } catch {
      /* private mode */
    }
    setVisible(false);
    const apply = updateSWRef.current;
    if (typeof apply === "function") {
      apply(true).catch(() => {
        window.location.reload();
      });
    } else {
      window.location.reload();
    }
  };

  if (!visible) return null;

  return (
    <div className="pwa-update-toast" role="status" aria-live="polite">
      <HStack gap={3} align="center" justify="between" wrap="wrap" width="100%">
        <Text type="inherit" size="sm" weight="medium">
          A new version of Cavren is ready. Your resumes stay on this device.
        </Text>
        <HStack gap={2} align="center">
          <Button variant="ghost" size="sm" label="Later" onClick={dismiss} />
          <Button
            variant="primary"
            size="sm"
            icon={<RefreshCw size={14} />}
            label="Reload"
            onClick={reload}
          />
        </HStack>
      </HStack>
    </div>
  );
}
