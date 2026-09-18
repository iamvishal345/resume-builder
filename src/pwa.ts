import { registerSW } from "virtual:pwa-register";

registerSW({
  immediate: true,
  onRegisteredSW(_swUrl, registration) {
    if (!registration) return;
    // Periodically look for updates while the tab is open
    setInterval(
      () => {
        registration.update().catch(() => {});
      },
      60 * 60 * 1000,
    );
  },
  onNeedRefresh() {
    const ok = window.confirm(
      "A new version of Cavren is ready. Reload to update? Your local resumes stay on this device.",
    );
    if (ok) window.location.reload();
  },
  onOfflineReady() {
    console.info("[cavren] Offline ready — edit and export without a network.");
  },
});
