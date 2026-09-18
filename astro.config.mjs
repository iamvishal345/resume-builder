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
      includeAssets: ["logo.svg", "bmc_qr.png", "icons/*.png"],
      registerType: "prompt",
      manifest: {
        name: "Cavren Resume Builder",
        short_name: "Cavren",
        description:
          "Offline-first, private resume builder. Data stays on your device.",
        theme_color: "#4b7a57",
        background_color: "#f6f5f1",
        display: "standalone",
        start_url: "/resumes",
        lang: "en",
        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        navigateFallback: "/offline/index.html",
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2,woff,ttf,json,webmanifest}"],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              networkTimeoutSeconds: 3,
            },
          },
        ],
      },
      // Avoid workbox terser flakiness in some CI/sandbox environments
      injectRegister: "script",
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
  },
});
