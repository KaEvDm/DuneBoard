import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const coreEntry = fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@duneboard/core": coreEntry
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [workspaceRoot]
    }
  }
});

