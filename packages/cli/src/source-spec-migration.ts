import { promises as fs } from "node:fs";
import path from "node:path";
import type { ParsedTask, TaskId } from "@duneboard/core";

export type SourceSpecClassification =
  | "task_related_spec"
  | "non_task_documentation"
  | "generated_documentation"
  | "task_archive"
  | "unknown";

export type SourceSpecFile = {
  path: string;
  content: string;
};

export type SourceSpecMigrationPlanItem = {
  archivePath?: string;
  classification: SourceSpecClassification;
  ownerTaskId?: TaskId;
  provenanceNote?: string;
  reason: string;
  requiredBeforeArchive: string[];
  sourcePath: string;
};

export type SourceSpecMigrationPlan = {
  items: SourceSpecMigrationPlanItem[];
  summary: Record<SourceSpecClassification, number>;
  taskRoot: string;
};

const ignoredCandidateDirs = new Set([".duneboard", ".git", "node_modules", "dist", "build", "coverage", ".turbo", ".vite"]);
const generatedPathSegments = new Set(["generated", "gen", "dist", "build", "coverage"]);
const nonTaskDocNames = new Set([
  "changelog.md",
  "code_of_conduct.md",
  "contributing.md",
  "license.md",
  "readme.md",
  "roadmap.md",
  "security.md"
]);

export async function readSourceSpecCandidateFiles(root: string, taskDirs: string[]): Promise<SourceSpecFile[]> {
  const files: SourceSpecFile[] = [];
  await readCandidateMarkdownFiles(root, root, files);
  return files.sort((left, right) => left.path.localeCompare(right.path));
}

export function createSourceSpecMigrationPlan(options: {
  files: SourceSpecFile[];
  taskDirs: string[];
  root: string;
  tasks: ParsedTask[];
}): SourceSpecMigrationPlan {
  const taskRoots = options.taskDirs.map((taskDir) => normalizePath(path.relative(options.root, taskDir)));
  const taskRoot = taskRoots[0] ?? "tasks";
  const taskIds = new Set(options.tasks.map((task) => task.id));

  const items = options.files
    .filter((file) => !isLiveTaskFile(file.path, taskRoots))
    .map((file) => classifySourceSpec(file, taskRoot, taskRoots, taskIds));

  return {
    items,
    summary: summarize(items),
    taskRoot
  };
}

export function formatSourceSpecMigrationPlan(plan: SourceSpecMigrationPlan): string {
  return [
    "# Source Spec Migration Plan",
    "",
    `Task root: \`${plan.taskRoot}\``,
    "",
    "Review this plan before moving files. For every task-related spec, fold current facts into the owning task's `## Design` before archiving the source.",
    "",
    "## Summary",
    "",
    ...Object.entries(plan.summary).map(([classification, count]) => `- ${classification}: ${count}`),
    "",
    ...formatPlanSection(plan.items, "task_related_spec", "Task-Related Specs"),
    ...formatPlanSection(plan.items, "non_task_documentation", "Non-Task Documentation"),
    ...formatPlanSection(plan.items, "generated_documentation", "Generated Documentation"),
    ...formatPlanSection(plan.items, "task_archive", "Existing Task Archives"),
    ...formatPlanSection(plan.items, "unknown", "Unknown")
  ].join("\n");
}

async function readCandidateMarkdownFiles(
  currentDir: string,
  root: string,
  files: SourceSpecFile[]
): Promise<void> {
  const entries = await fs.readdir(currentDir, { withFileTypes: true }).catch((error: unknown) => {
    if (isNodeError(error) && error.code === "ENOENT") {
      return [];
    }

    throw error;
  });

  await Promise.all(
    entries.map(async (entry) => {
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = normalizePath(path.relative(root, absolutePath));

      if (entry.isDirectory()) {
        if (ignoredCandidateDirs.has(entry.name.toLowerCase())) {
          return;
        }

        await readCandidateMarkdownFiles(absolutePath, root, files);
        return;
      }

      if (!entry.isFile() || !entry.name.endsWith(".md")) {
        return;
      }

      files.push({
        path: relativePath,
        content: await fs.readFile(absolutePath, "utf8")
      });
    })
  );
}

function classifySourceSpec(
  file: SourceSpecFile,
  taskRoot: string,
  taskRoots: string[],
  taskIds: Set<TaskId>
): SourceSpecMigrationPlanItem {
  if (isTaskArchivePath(file.path, taskRoots)) {
    return {
      classification: "task_archive",
      reason: "Already under a task-root archive subtree.",
      requiredBeforeArchive: [],
      sourcePath: file.path
    };
  }

  if (isGeneratedDocumentation(file)) {
    return {
      classification: "generated_documentation",
      reason: "Generated documentation should stay with its owning generator.",
      requiredBeforeArchive: [],
      sourcePath: file.path
    };
  }

  if (isNonTaskDocumentation(file.path)) {
    return {
      classification: "non_task_documentation",
      reason: "General project documentation is not task-owned design content.",
      requiredBeforeArchive: [],
      sourcePath: file.path
    };
  }

  const ownerTaskId = findOwnerTaskId(file, taskIds);

  if (ownerTaskId && isLikelyTaskRelatedSource(file.path)) {
    const archivePath = archivePathFor(file.path, taskRoot);
    return {
      archivePath,
      classification: "task_related_spec",
      ownerTaskId,
      provenanceNote: `Migrated source spec ${file.path} to ${archivePath}.`,
      reason: `References live task ${ownerTaskId}.`,
      requiredBeforeArchive: [
        `Fold current design facts into ${ownerTaskId} ## Design.`,
        "Review the owning task before moving the source file.",
        "Record provenance in the task notes or work log."
      ],
      sourcePath: file.path
    };
  }

  return {
    classification: "unknown",
    reason: "No live task reference or known documentation category was detected.",
    requiredBeforeArchive: ["Review manually before moving or archiving."],
    sourcePath: file.path
  };
}

function formatPlanSection(
  items: SourceSpecMigrationPlanItem[],
  classification: SourceSpecClassification,
  title: string
): string[] {
  const sectionItems = items.filter((item) => item.classification === classification);

  if (sectionItems.length === 0) {
    return [`## ${title}`, "", "None.", ""];
  }

  return [
    `## ${title}`,
    "",
    ...sectionItems.flatMap((item) => [
      `- [ ] \`${item.sourcePath}\`${item.ownerTaskId ? ` -> ${item.ownerTaskId}` : ""}`,
      `  - Reason: ${item.reason}`,
      ...(item.archivePath ? [`  - Archive path: \`${item.archivePath}\``] : []),
      ...(item.provenanceNote ? [`  - Provenance note: ${item.provenanceNote}`] : []),
      ...item.requiredBeforeArchive.map((action) => `  - Required: ${action}`)
    ]),
    ""
  ];
}

function summarize(items: SourceSpecMigrationPlanItem[]): Record<SourceSpecClassification, number> {
  return {
    generated_documentation: countByClassification(items, "generated_documentation"),
    non_task_documentation: countByClassification(items, "non_task_documentation"),
    task_archive: countByClassification(items, "task_archive"),
    task_related_spec: countByClassification(items, "task_related_spec"),
    unknown: countByClassification(items, "unknown")
  };
}

function countByClassification(items: SourceSpecMigrationPlanItem[], classification: SourceSpecClassification): number {
  return items.filter((item) => item.classification === classification).length;
}

function isLiveTaskFile(filePath: string, taskRoots: string[]): boolean {
  return taskRoots.some((taskRoot) => isUnderPath(filePath, taskRoot) && !isTaskArchivePath(filePath, [taskRoot]));
}

function isTaskArchivePath(filePath: string, taskRoots: string[]): boolean {
  return taskRoots.some((taskRoot) => isUnderPath(filePath, `${taskRoot}/archive`));
}

function isGeneratedDocumentation(file: SourceSpecFile): boolean {
  const segments = file.path.toLowerCase().split("/");
  const fileName = segments.at(-1) ?? "";

  return (
    segments.some((segment) => generatedPathSegments.has(segment)) ||
    fileName.includes(".generated.") ||
    /generated by|do not edit|auto-generated/i.test(file.content)
  );
}

function isNonTaskDocumentation(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  const fileName = normalized.split("/").at(-1) ?? normalized;

  return (
    nonTaskDocNames.has(fileName) ||
    (normalized.startsWith("docs/") && !isLikelyTaskRelatedSource(normalized)) ||
    normalized.startsWith(".github/") ||
    normalized.startsWith("skills/")
  );
}

function isLikelyTaskRelatedSource(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  const segments = normalized.split("/");

  return segments.some((segment) =>
    ["backlog", "design", "designs", "issue", "issues", "plan", "plans", "spec", "specs", "status", "todo"].includes(segment)
  );
}

function findOwnerTaskId(file: SourceSpecFile, taskIds: Set<TaskId>): TaskId | undefined {
  const referencedIds = `${file.path}\n${file.content}`.match(/DB-\d{4}/g) ?? [];
  return referencedIds.find((id): id is TaskId => taskIds.has(id as TaskId));
}

function archivePathFor(sourcePath: string, taskRoot: string): string {
  if (isUnderPath(sourcePath, taskRoot)) {
    return `${taskRoot}/archive/${sourcePath.slice(taskRoot.length + 1)}`;
  }

  return `${taskRoot}/archive/${sourcePath}`;
}

function isUnderPath(filePath: string, directoryPath: string): boolean {
  return filePath === directoryPath || filePath.startsWith(`${directoryPath}/`);
}

function normalizePath(value: string): string {
  return value.replace(/\\/g, "/");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
