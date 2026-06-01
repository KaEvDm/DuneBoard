import { promises as fs } from "node:fs";
import path from "node:path";
import { buildBoardIndex, parseTaskFile, taskFrontmatterSchema, type BoardFile, type ParsedTask } from "@duneboard/core";
import { parseDocument, stringify } from "yaml";

const taskFilePattern = /^DB-\d{4}-.+\.md$/;

export type LoadedBoard = {
  root: string;
  taskDir: string;
  files: BoardFile[];
  index: ReturnType<typeof buildBoardIndex>;
};

export async function loadBoard(rootInput: string): Promise<LoadedBoard> {
  const root = path.resolve(rootInput);
  const taskDir = path.join(root, "tasks");
  const files = await readMarkdownTaskFiles(taskDir, root);

  return {
    root,
    taskDir,
    files,
    index: buildBoardIndex(files)
  };
}

export async function readTaskFile(taskDir: string, task: ParsedTask): Promise<string> {
  return fs.readFile(path.join(taskDir, path.basename(task.filePath)), "utf8");
}

export async function writeTaskFile(taskDir: string, task: ParsedTask, content: string): Promise<void> {
  await fs.writeFile(path.join(taskDir, path.basename(task.filePath)), content);
}

export async function createTaskFile(options: {
  root: string;
  title: string;
  kind: string;
  status: string;
  priority: string;
  parent: string | null;
  dependsOn: string[];
  labels: string[];
}): Promise<{ id: string; filePath: string }> {
  const board = await loadBoard(options.root);
  const id = nextTaskId(board.index.tasks.map((task) => task.id));
  const slug = slugify(options.title);
  const filePath = path.join(board.taskDir, `${id}-${slug}.md`);
  const now = new Date().toISOString();

  const frontmatter = stringify({
    id,
    title: options.title,
    kind: options.kind,
    status: options.status,
    priority: options.priority,
    parent: options.parent,
    depends_on: options.dependsOn,
    blocked_by: [],
    relates_to: [],
    assignee: null,
    labels: options.labels,
    created_at: now,
    updated_at: now
  }).trim();

  const content = `---\n${frontmatter}\n---\n\n## Goal\n\n\n## Acceptance Criteria\n\n- [ ] \n\n## Notes\n\n\n## Open Questions\n\n\n## Work Log\n\n- ${dateStamp()}: Created task.\n`;

  await fs.mkdir(board.taskDir, { recursive: true });
  await fs.writeFile(filePath, content, { flag: "wx" });

  return {
    id,
    filePath: path.relative(board.root, filePath).replace(/\\/g, "/")
  };
}

export function setTaskStatus(content: string, status: string): string {
  return updateTaskFields(content, {
    status,
    updated_at: new Date().toISOString()
  });
}

export function updateTaskFields(content: string, fields: Record<string, unknown>): string {
  return updateFrontmatter(content, (frontmatter) => {
    Object.entries(fields).forEach(([key, value]) => frontmatter.set(key, value));
  });
}

export function addTaskDependencies(content: string, dependencyIds: string[]): string {
  return updateFrontmatter(content, (frontmatter) => {
    const current = frontmatter.get("depends_on");
    const currentIds = Array.isArray(current) ? current.map(String) : [];
    frontmatter.set("depends_on", [...new Set([...currentIds, ...dependencyIds])]);
    frontmatter.set("updated_at", new Date().toISOString());
  });
}

export function appendWorkLog(content: string, note: string): string {
  const contentWithTimestamp = updateTaskFields(content, {
    updated_at: new Date().toISOString()
  });
  const entry = `- ${dateStamp()}: ${note.trim()}`;
  const marker = "## Work Log";
  const markerIndex = contentWithTimestamp.indexOf(marker);

  if (markerIndex === -1) {
    return `${contentWithTimestamp.trimEnd()}\n\n${marker}\n\n${entry}\n`;
  }

  const insertAt = markerIndex + marker.length;
  const before = contentWithTimestamp.slice(0, insertAt);
  const after = contentWithTimestamp.slice(insertAt);
  const trimmedAfter = after.replace(/^\s*/, "\n\n");

  if (trimmedAfter.trim().length === 0) {
    return `${before}\n\n${entry}\n`;
  }

  return `${before}${trimmedAfter.trimEnd()}\n${entry}\n`;
}

export function parseDependsOn(values: string[] | undefined): string[] {
  return splitMultiValue(values);
}

export function parseLabels(values: string[] | undefined): string[] {
  return splitMultiValue(values);
}

async function readMarkdownTaskFiles(taskDir: string, root: string): Promise<BoardFile[]> {
  const entries = await fs.readdir(taskDir, { withFileTypes: true }).catch((error: unknown) => {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  const files = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name.endsWith(".md"))
      .map(async (entry) => {
        const absolutePath = path.join(taskDir, entry.name);
        return {
          path: path.relative(root, absolutePath).replace(/\\/g, "/"),
          content: await fs.readFile(absolutePath, "utf8")
        };
      })
  );

  return files.sort((left, right) => left.path.localeCompare(right.path));
}

function updateFrontmatter(content: string, update: (frontmatter: ReturnType<typeof parseDocument>) => void): string {
  if (!content.startsWith("---\n")) {
    throw new Error("Task file must start with YAML frontmatter.");
  }

  const endIndex = content.indexOf("\n---", 4);

  if (endIndex === -1) {
    throw new Error("Task file frontmatter is not closed.");
  }

  const document = parseDocument(content.slice(4, endIndex));
  update(document);

  const body = content.slice(endIndex + 4).replace(/^\s*/, "\n\n");
  return `---\n${document.toString().trim()}\n---${body}`;
}

function nextTaskId(ids: string[]): string {
  const nextNumber =
    Math.max(
      0,
      ...ids.map((id) => {
        const match = id.match(/^DB-(\d{4})$/);
        return match ? Number(match[1]) : 0;
      })
    ) + 1;

  return `DB-${String(nextNumber).padStart(4, "0")}`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64) || "task"
  );
}

function splitMultiValue(values: string[] | undefined): string[] {
  return [
    ...new Set(
      (values ?? [])
        .flatMap((value) => value.split(/[,\s]+/))
        .map((value) => value.trim())
        .filter(Boolean)
    )
  ];
}

function dateStamp(): string {
  return new Date().toISOString().slice(0, 10);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export function validateTaskContent(filePath: string, content: string): ParsedTask {
  const result = parseTaskFile(filePath, content);

  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join("\n"));
  }

  taskFrontmatterSchema.parse(result.task);
  return result.task;
}
