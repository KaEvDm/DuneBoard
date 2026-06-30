import type { BoardIssue, ParsedTask, TaskId } from "@duneboard/core";

export function printTask(task: ParsedTask): string {
  return `${task.id}  ${task.priority}  ${task.status.padEnd(11)}  ${task.kind.padEnd(8)}  ${task.title}`;
}

export function printTaskDetail(task: ParsedTask, options: { includeDesign?: boolean } = {}): string {
  const lines = [
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
    task.sections.Goal || "None"
  ];

  if (options.includeDesign) {
    lines.push("", "Design:", task.sections.Design || "None");
  }

  lines.push(
    "",
    "Acceptance Criteria:",
    task.acceptance.length ? task.acceptance.map((item) => `- [${item.checked ? "x" : " "}] ${item.text}`).join("\n") : "None",
    "",
    "Open Questions:",
    task.sections["Open Questions"] || "None",
    "",
    "Work Log:",
    task.sections["Work Log"] || "None"
  );

  return lines.join("\n");
}

export function printTaskDesign(task: ParsedTask): string {
  return task.sections.Design?.trim() ?? "";
}

export function printTaskSummaryDetail(task: ParsedTask, options: { logTail?: number } = {}): string {
  const acceptanceTotal = task.acceptance.length;
  const acceptanceChecked = task.acceptance.filter((item) => item.checked).length;
  const workLog = tailWorkLog(task, options.logTail ?? 3);

  return [
    `${task.id} ${task.title}`,
    "",
    `Kind:       ${task.kind}`,
    `Status:     ${task.status}`,
    `Priority:   ${task.priority}`,
    `Parent:     ${task.parent ?? "none"}`,
    `Depends:    ${task.depends_on.length ? task.depends_on.join(", ") : "none"}`,
    `Labels:     ${task.labels.length ? task.labels.join(", ") : "none"}`,
    `File:       ${task.filePath}`,
    `Acceptance: ${acceptanceChecked}/${acceptanceTotal} checked`,
    "",
    "Goal:",
    task.sections.Goal || "None",
    "",
    "Latest Work Log:",
    workLog.length ? workLog.join("\n") : "None"
  ].join("\n");
}

export function printWorkLog(task: ParsedTask, options: { tail?: number } = {}): string {
  const workLog = tailWorkLog(task, options.tail ?? 5);
  return workLog.length ? workLog.join("\n") : "No work log entries.";
}

export function printPreflightCompact(options: {
  archiveSubtrees: string[];
  issues: BoardIssue[];
  liveTasks: number;
  nextTasks: ParsedTask[];
}): string {
  if (options.issues.length > 0) {
    return `FAIL ${options.issues.length} issue(s) across ${options.liveTasks} live tasks.`;
  }

  const next = options.nextTasks.length ? options.nextTasks.map((task) => task.id).join(", ") : "none";
  const archives = options.archiveSubtrees.length ? options.archiveSubtrees.join(", ") : "none";
  return `OK ${options.liveTasks} live tasks. Next: ${next}. Ignored archives: ${archives}.`;
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

export function toTaskDetailSummary(task: ParsedTask, options: { logTail?: number } = {}) {
  const acceptanceChecked = task.acceptance.filter((item) => item.checked).length;

  return {
    ...toTaskSummary(task),
    acceptance: {
      checked: acceptanceChecked,
      total: task.acceptance.length,
      items: task.acceptance
    },
    goal: task.sections.Goal ?? "",
    workLog: tailWorkLog(task, options.logTail ?? 3)
  };
}

export function toTaskWorkLog(task: ParsedTask, options: { tail?: number } = {}) {
  return {
    id: task.id,
    title: task.title,
    filePath: task.filePath,
    workLog: tailWorkLog(task, options.tail ?? 5)
  };
}

export function tailWorkLog(task: ParsedTask, count: number): string[] {
  if (count <= 0) {
    return [];
  }

  return workLogEntries(task).slice(-count);
}

export function workLogEntries(task: ParsedTask): string[] {
  const workLog = task.sections["Work Log"]?.trim();

  if (!workLog) {
    return [];
  }

  const entries: string[] = [];
  let current: string[] = [];

  workLog.split(/\r?\n/).forEach((line) => {
    if (/^\s*-\s+/.test(line)) {
      pushCurrentEntry(entries, current);
      current = [line.trimEnd()];
      return;
    }

    if (line.trim().length > 0 && current.length > 0) {
      current.push(line.trimEnd());
    }
  });

  pushCurrentEntry(entries, current);
  return entries;
}

export function taskById(tasksById: Record<TaskId, ParsedTask>, id: string): ParsedTask {
  const task = tasksById[id];

  if (!task) {
    throw new Error(`Task ${id} does not exist.`);
  }

  return task;
}

function pushCurrentEntry(entries: string[], current: string[]): void {
  const entry = current.join("\n").trimEnd();

  if (entry) {
    entries.push(entry);
  }
}
