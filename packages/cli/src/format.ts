import type { BoardIssue, ParsedTask, TaskId } from "@duneboard/core";

export function printTask(task: ParsedTask): string {
  return `${task.id}  ${task.priority}  ${task.status.padEnd(11)}  ${task.kind.padEnd(8)}  ${task.title}`;
}

export function printTaskDetail(task: ParsedTask): string {
  return [
    `${task.id} ${task.title}`,
    "",
    `Kind:     ${task.kind}`,
    `Status:   ${task.status}`,
    `Priority: ${task.priority}`,
    `Parent:   ${task.parent ?? "none"}`,
    `Depends:  ${task.depends_on.length ? task.depends_on.join(", ") : "none"}`,
    `Labels:   ${task.labels.length ? task.labels.join(", ") : "none"}`,
    "",
    "Goal:",
    task.sections.Goal || "None",
    "",
    "Acceptance Criteria:",
    task.acceptance.length ? task.acceptance.map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`).join("\n") : "None",
    "",
    "Open Questions:",
    task.sections["Open Questions"] || "None",
    "",
    "Work Log:",
    task.sections["Work Log"] || "None"
  ].join("\n");
}

export function printIssues(issues: BoardIssue[]): string {
  return issues
    .map((issue) => {
      const target = issue.taskId ? `${issue.taskId}: ` : "";
      const file = issue.filePath ? ` (${issue.filePath})` : "";
      return `${issue.severity.toUpperCase()} ${issue.code}: ${target}${issue.message}${file}`;
    })
    .join("\n");
}

export function toTaskSummary(task: ParsedTask) {
  return {
    id: task.id,
    title: task.title,
    kind: task.kind,
    status: task.status,
    priority: task.priority,
    parent: task.parent,
    depends_on: task.depends_on,
    labels: task.labels,
    filePath: task.filePath
  };
}

export function taskById(tasksById: Record<TaskId, ParsedTask>, id: string): ParsedTask {
  const task = tasksById[id];

  if (!task) {
    throw new Error(`Task ${id} does not exist.`);
  }

  return task;
}

