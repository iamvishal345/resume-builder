/// <reference types="astro/client" />

/**
 * Ambient types for Vite PWA virtual modules.
 * Declared here because `vite-plugin-pwa` is a transitive peer of
 * `@vite-pwa/astro` and is not always hoisted under pnpm, so
 * `/// <reference types="vite-plugin-pwa/…" />` cannot resolve.
 */

declare module "virtual:pwa-info" {
  export interface PwaInfo {
    pwaInDevEnvironment: boolean;
    webManifest: {
      href: string;
      useCredentials: boolean;
      linkTag: string;
    };
    registerSW?: {
      /** @deprecated use `mode` */
      inline: boolean;
      mode: "inline" | "script" | "script-defer";
      inlinePath: string;
      registerPath: string;
      scope: string;
      type: "classic" | "module";
      scriptTag?: string;
    };
  }

  export const pwaInfo: PwaInfo | undefined;
}

declare module "virtual:pwa-register" {
  export interface RegisterSWOptions {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: (
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    onRegisteredSW?: (
      swScriptUrl: string,
      registration: ServiceWorkerRegistration | undefined,
    ) => void;
    onRegisterError?: (error: unknown) => void;
  }

  export function registerSW(
    options?: RegisterSWOptions,
  ): (reloadPage?: boolean) => Promise<void>;
}
