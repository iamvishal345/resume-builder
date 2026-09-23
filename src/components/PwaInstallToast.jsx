import { useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
import { HStack } from "@astryxdesign/core/Layout";
import { Text } from "@astryxdesign/core/Text";
import { Download } from "lucide-react";
import {
  dismissInstall,
  wasInstallDismissed,
} from "@features/resumes/prefs";

const isStandalone = () => {
  if (typeof window === "undefined") return true;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    Boolean(window.navigator.standalone)
  );
};

/**
 * Install snackbar — shown once the browser fires beforeinstallprompt.
 * Uses the same chrome as PwaUpdateToast. Dismiss is remembered locally.
 */
export default function PwaInstallToast() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    if (isStandalone() || wasInstallDismissed()) return;

    const adopt = (event) => {
      if (!event) return;
      setPromptEvent(event);
    };

    // Early inline capture in Layout.astro may have already stashed the event.
    adopt(window.__deferredPrompt);

    const onBeforeInstall = (event) => {
      event.preventDefault();
      window.__deferredPrompt = event;
      window.dispatchEvent(new CustomEvent("pwa-install-ready"));
      adopt(event);
    };

    const onReady = () => adopt(window.__deferredPrompt);

    const onInstalled = () => {
      setPromptEvent(null);
      window.__deferredPrompt = null;
      dismissInstall();
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("pwa-install-ready", onReady);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("pwa-install-ready", onReady);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = () => {
    dismissInstall();
    setPromptEvent(null);
    window.__deferredPrompt = null;
  };

  const install = async () => {
    if (!promptEvent) return;
    try {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === "accepted") dismissInstall();
    } catch {
      /* user closed the native sheet */
    }
    setPromptEvent(null);
    window.__deferredPrompt = null;
  };

  if (!promptEvent) return null;

  return (
    <div className="pwa-update-toast pwa-install-toast" role="status" aria-live="polite">
      <HStack gap={3} align="center" justify="between" wrap="wrap" width="100%">
        <Text type="inherit" size="sm" weight="medium">
          Install Cavren for offline editing — resumes stay on this device.
        </Text>
        <HStack gap={2} align="center">
          <Button variant="ghost" size="sm" label="Not now" onClick={dismiss} />
          <Button
            variant="primary"
            size="sm"
            icon={<Download size={14} />}
            label="Install"
            onClick={install}
          />
        </HStack>
      </HStack>
    </div>
  );
}
