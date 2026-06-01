import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const coreEntry = fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url));
const boardRoot = process.env.DUNEBOARD_ROOT ? path.resolve(process.env.DUNEBOARD_ROOT) : workspaceRoot;

const virtualBoardModule = "virtual:duneboard-board";
const resolvedVirtualBoardModule = `\0${virtualBoardModule}`;

export default defineConfig({
  plugins: [duneboardBoardPlugin(boardRoot), react()],
  resolve: {
    alias: {
      "@duneboard/core": coreEntry
    }
  },
  server: {
    port: 5173,
    fs: {
      allow: [...new Set([workspaceRoot, boardRoot])]
    }
  }
});

function duneboardBoardPlugin(root: string): Plugin {
  return {
    name: "duneboard-board-data",
    resolveId(id) {
      return id === virtualBoardModule ? resolvedVirtualBoardModule : null;
    },
    load(id) {
      if (id !== resolvedVirtualBoardModule) {
        return null;
      }

      const files = readBoardFiles(root);

      files.forEach((file) => {
        this.addWatchFile(path.join(root, file.path));
      });

      return [
        `export const boardRoot = ${JSON.stringify(root)};`,
        `export const files = ${JSON.stringify(files)};`
      ].join("\n");
    }
  };
}

function readBoardFiles(root: string): Array<{ path: string; content: string }> {
  const taskDir = path.join(root, "tasks");

  if (!existsSync(taskDir)) {
    throw new Error(`DuneBoard task directory not found: ${taskDir}`);
  }

  return readdirSync(taskDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .filter((entry) => entry.name.endsWith(".md"))
    .map((entry) => {
      const absolutePath = path.join(taskDir, entry.name);

      return {
        path: path.relative(root, absolutePath).replace(/\\/g, "/"),
        content: readFileSync(absolutePath, "utf8")
      };
    })
    .sort((left, right) => left.path.localeCompare(right.path));
}
