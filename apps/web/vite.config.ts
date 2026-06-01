import { existsSync, readdirSync, readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

type BoardProject = {
  id: string;
  isDefault?: boolean;
  name: string;
  root: string;
};

type ProjectConfig = {
  projects?: Array<{
    id?: string;
    name?: string;
    root?: string;
  }>;
};

type NextFunction = (error?: unknown) => void;

type MiddlewareServer = {
  middlewares: {
    use(handler: (request: IncomingMessage, response: ServerResponse, next: NextFunction) => void): void;
  };
};

const workspaceRoot = fileURLToPath(new URL("../..", import.meta.url));
const coreEntry = fileURLToPath(new URL("../../packages/core/src/index.ts", import.meta.url));
const localProjectConfig = path.join(workspaceRoot, ".duneboard", "projects.local.json");

export default defineConfig({
  plugins: [duneboardProjectsPlugin(), react()],
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

function duneboardProjectsPlugin(): Plugin {
  return {
    name: "duneboard-projects-api",
    configurePreviewServer(server) {
      installProjectApi(server);
    },
    configureServer(server) {
      installProjectApi(server);
    }
  };
}

function installProjectApi(server: MiddlewareServer): void {
  server.middlewares.use((request: IncomingMessage, response: ServerResponse, next: NextFunction) => {
    if (!request.url || request.method !== "GET") {
      next();
      return;
    }

    const url = new URL(request.url, "http://127.0.0.1");

    try {
      if (url.pathname === "/api/projects") {
        writeJson(response, 200, { projects: loadProjects() });
        return;
      }

      const boardMatch = url.pathname.match(/^\/api\/projects\/([^/]+)\/board$/);

      if (boardMatch?.[1]) {
        const projectId = decodeURIComponent(boardMatch[1]);
        const project = loadProjects().find((candidate) => candidate.id === projectId);

        if (!project) {
          writeJson(response, 404, { error: `Project not found: ${projectId}` });
          return;
        }

        writeJson(response, 200, {
          project,
          files: readBoardFiles(project.root)
        });
        return;
      }
    } catch (error) {
      writeJson(response, 500, { error: error instanceof Error ? error.message : String(error) });
      return;
    }

    next();
  });
}

function loadProjects(): BoardProject[] {
  const projects = new Map<string, BoardProject>();
  const defaultProject: BoardProject = {
    id: "duneboard",
    isDefault: true,
    name: "DuneBoard",
    root: workspaceRoot
  };

  projects.set(defaultProject.id, defaultProject);

  readProjectConfig(localProjectConfig).forEach((project) => {
    projects.set(project.id, project);
  });

  return [...projects.values()].filter((project) => existsSync(path.join(project.root, "tasks")));
}

function readProjectConfig(configPath: string): BoardProject[] {
  if (!existsSync(configPath)) {
    return [];
  }

  const parsed = JSON.parse(readFileSync(configPath, "utf8")) as ProjectConfig;

  return (parsed.projects ?? [])
    .map((project) => normalizeProject(project))
    .filter((project): project is BoardProject => Boolean(project));
}

function normalizeProject(project: NonNullable<ProjectConfig["projects"]>[number]): BoardProject | null {
  const id = project.id?.trim();
  const name = project.name?.trim();
  const root = project.root?.trim();

  if (!id || !name || !root || !/^[a-z0-9-]+$/.test(id)) {
    return null;
  }

  return {
    id,
    name,
    root: path.resolve(workspaceRoot, root)
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

function writeJson(response: ServerResponse, status: number, value: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}
