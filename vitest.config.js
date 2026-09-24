import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
  resolve: {
    alias: {
      "@lib": path.join(root, "src/lib"),
      "@features": path.join(root, "src/features"),
      "@store": path.join(root, "src/store"),
      "@data": path.join(root, "src/data"),
      "@components": path.join(root, "src/components"),
    },
  },
});
