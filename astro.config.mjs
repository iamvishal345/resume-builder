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
        // Precache the offline fallback shell and editor shell specifically
        additionalManifestEntries: [
          { url: "/offline/index.html", revision: "1" },
          { url: "/editor/index.html", revision: "1" },
          { url: "/resumes/index.html", revision: "1" },
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
              matchOptions: { ignoreSearch: true },
              plugins: [
                {
                  handlerDidError: async ({ request }) => {
                    const matchOpts = { ignoreSearch: true };
                    return (
                      (await caches.match(request.url, matchOpts)) ||
                      (await caches.match("/editor/index.html", matchOpts)) ||
                      (await caches.match("/editor/", matchOpts)) ||
                      (await caches.match("/editor", matchOpts)) ||
                      (await caches.match("/resumes/index.html", matchOpts)) ||
                      (await caches.match("/offline/index.html", matchOpts)) ||
                      (await caches.match("/offline/", matchOpts)) ||
                      (await caches.match("/offline", matchOpts)) ||
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
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/pdfjs-dist")) {
              return "vendor-pdfjs";
            }
            if (id.includes("node_modules/docx")) {
              return "vendor-docx";
            }
            if (id.includes("node_modules/slate") || id.includes("node_modules/slate-react")) {
              return "vendor-slate";
            }
            if (id.includes("node_modules/@astryxdesign")) {
              return "vendor-astryx";
            }
            if (id.includes("node_modules/lucide-react")) {
              return "vendor-lucide";
            }
          },
        },
      },
    },
    optimizeDeps: {
      include: ["pdfjs-dist"],
    },
  },
});
