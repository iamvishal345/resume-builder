import AstroPWA from "@vite-pwa/astro";
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import path from "path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://astro.build/config
export default defineConfig({
  integrations: [
    react(),
    AstroPWA({
      mode: "production",
      base: "/",
      scope: "/",
      includeAssets: [
        "logo.svg",
        "bmc_qr.png",
        "icons/icon-192.png",
        "icons/icon-512.png",
        "icons/icon-maskable-512.png",
      ],
      registerType: "prompt",
      manifest: {
        id: "/",
        name: "Cavren Resume Builder",
        short_name: "Cavren",
        description:
          "Offline-first, private resume builder. Data stays on your device.",
        theme_color: "#4b7a57",
        background_color: "#f6f5f1",
        display: "standalone",
        start_url: "/resumes",
        lang: "en",
        categories: ["productivity"],
        orientation: "any",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icons/icon-maskable-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        shortcuts: [
          {
            name: "My resumes",
            short_name: "Resumes",
            url: "/resumes",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
          {
            name: "Editor",
            short_name: "Editor",
            url: "/editor",
            icons: [
              {
                src: "/icons/icon-192.png",
                sizes: "192x192",
                type: "image/png",
              },
            ],
          },
        ],
      },
      workbox: {
        navigateFallback: null,
        clientsClaim: true,
        // Exclude .html from globPatterns so HTML pages are not precached ahead of live network calls.
        globPatterns: [
          "**/*.{js,mjs,css,svg,png,ico,woff2,woff,ttf,json,webmanifest}",
        ],
        // Precache the offline fallback shell specifically
        additionalManifestEntries: [
          { url: "/offline/index.html", revision: "1" },
        ],
        // pdf.worker.min.mjs is ~1.2MB; keep headroom for future assets
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.mode === "navigate" || request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              plugins: [
                {
                  handlerDidError: async () => {
                    return (
                      (await caches.match("/offline/index.html")) ||
                      (await caches.match("/offline")) ||
                      Response.error()
                    );
                  },
                },
              ],
            },
          },
        ],
      },
      experimental: {
        // Map /resumes ↔ /resumes/ ↔ resumes/index.html in the precache
        directoryAndTrailingSlashHandler: true,
      },
      // Manual registration via PwaUpdateToast (virtual:pwa-register)
      injectRegister: false,
      minify: false,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "./src/components"),
        "@store": path.resolve(__dirname, "./src/store"),
        "@routes": path.resolve(__dirname, "./src/routes"),
        "@data": path.resolve(__dirname, "./src/data"),
        "@features": path.resolve(__dirname, "./src/features"),
        "@lib": path.resolve(__dirname, "./src/lib"),
        "@hooks": path.resolve(__dirname, "./src/hooks"),
      },
    },
    optimizeDeps: {
      include: ["pdfjs-dist"],
    },
  },
});
