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

  return [...projects.values()].filter((project) =>
    readTaskRoots(project.root).some((taskRoot) => existsSync(path.join(project.root, taskRoot)))
  );
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
  const taskRoots = readTaskRoots(root);
  const taskDirs = taskRoots.map((taskRoot) => path.join(root, taskRoot));

  if (!taskDirs.some((taskDir) => existsSync(taskDir))) {
    throw new Error(`DuneBoard task directory not found in: ${taskDirs.join(", ")}`);
  }

  return taskDirs
    .flatMap((taskDir) => readBoardFilesFromTaskDir(taskDir, taskDir, root))
    .sort((left, right) => left.path.localeCompare(right.path));
}

function readBoardFilesFromTaskDir(
  currentDir: string,
  taskDir: string,
  root: string
): Array<{ path: string; content: string }> {
  if (!existsSync(currentDir)) {
    return [];
  }

  return readdirSync(currentDir, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (isArchiveSubtree(absolutePath, taskDir)) {
        return [];
      }

      return readBoardFilesFromTaskDir(absolutePath, taskDir, root);
    }

    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      return [];
    }

    return [
      {
        path: path.relative(root, absolutePath).replace(/\\/g, "/"),
        content: readFileSync(absolutePath, "utf8")
      }
    ];
  });
}

function readTaskRoots(root: string): string[] {
  const configPath = path.join(root, ".duneboard", "config.yml");

  if (!existsSync(configPath)) {
    return ["tasks"];
  }

  const lines = readFileSync(configPath, "utf8").split(/\r?\n/);
  const taskRoots: string[] = [];
  let inTaskRoots = false;

  for (const line of lines) {
    if (/^task_roots:\s*$/.test(line)) {
      inTaskRoots = true;
      continue;
    }

    if (inTaskRoots && /^\S/.test(line)) {
      break;
    }

    const match = inTaskRoots ? line.match(/^\s*-\s*["']?(.+?)["']?\s*$/) : null;

    if (match?.[1]) {
      taskRoots.push(match[1].trim());
    }
  }

  return taskRoots.length > 0 ? taskRoots : ["tasks"];
}

function writeJson(response: ServerResponse, status: number, value: unknown): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}

function isArchiveSubtree(absolutePath: string, taskDir: string): boolean {
  const relativeParts = path.relative(taskDir, absolutePath).split(path.sep);
  return relativeParts[0]?.toLowerCase() === "archive";
}
