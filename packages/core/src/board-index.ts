import { parseTaskFile } from "./task-parser";
import type { BoardIssue, ParsedTask, TaskId } from "./task-schema";

export type BoardFile = {
  path: string;
  content: string;
};

export type BoardIndex = {
  tasks: ParsedTask[];
  tasksById: Record<TaskId, ParsedTask>;
  childrenById: Record<TaskId, TaskId[]>;
  dependentsById: Record<TaskId, TaskId[]>;
  availableTaskIds: TaskId[];
  dependencyBlockedTaskIds: TaskId[];
  issues: BoardIssue[];
};

export function buildBoardIndex(files: BoardFile[]): BoardIndex {
  const tasks: ParsedTask[] = [];
  const issues: BoardIssue[] = [];

  files.forEach((file) => {
    const result = parseTaskFile(file.path, file.content);

    if (result.ok) {
      tasks.push(result.task);
    } else {
      issues.push(...result.issues);
    }
  });

  const tasksById: Record<TaskId, ParsedTask> = {};
  const duplicateIds = new Set<TaskId>();

  tasks.forEach((task) => {
    if (tasksById[task.id]) {
      duplicateIds.add(task.id);
      issues.push({
        code: "duplicate_task_id",
        filePath: task.filePath,
        message: `Task ID ${task.id} is used by more than one file.`,
        severity: "error",
        taskId: task.id
      });
      return;
    }

    tasksById[task.id] = task;
  });

  const childrenById: Record<TaskId, TaskId[]> = {};
  const dependentsById: Record<TaskId, TaskId[]> = {};

  tasks.forEach((task) => {
    if (duplicateIds.has(task.id)) {
      return;
    }

    if (task.parent) {
      if (!tasksById[task.parent]) {
        issues.push({
          code: "missing_parent",
          filePath: task.filePath,
          message: `Parent task ${task.parent} does not exist.`,
          severity: "error",
          taskId: task.id
        });
      } else {
        childrenById[task.parent] = [...(childrenById[task.parent] ?? []), task.id];
      }
    }

    task.depends_on.forEach((dependencyId) => {
      if (!tasksById[dependencyId]) {
        issues.push({
          code: "missing_dependency",
          filePath: task.filePath,
          message: `Dependency task ${dependencyId} does not exist.`,
          severity: "error",
          taskId: task.id
        });
        return;
      }

      dependentsById[dependencyId] = [...(dependentsById[dependencyId] ?? []), task.id];
    });
  });

  issues.push(...detectDependencyCycles(tasksById));

  const availableTaskIds = tasks
    .filter((task) => task.status === "ready")
    .filter((task) => task.depends_on.every((dependencyId) => tasksById[dependencyId]?.status === "done"))
    .map((task) => task.id);

  const dependencyBlockedTaskIds = tasks
    .filter((task) => task.status === "ready")
    .filter((task) => task.depends_on.some((dependencyId) => tasksById[dependencyId]?.status !== "done"))
    .map((task) => task.id);

  return {
    tasks: sortTasks(tasks),
    tasksById,
    childrenById: sortIdMap(childrenById),
    dependentsById: sortIdMap(dependentsById),
    availableTaskIds: availableTaskIds.sort(),
    dependencyBlockedTaskIds: dependencyBlockedTaskIds.sort(),
    issues
  };
}

function sortTasks(tasks: ParsedTask[]): ParsedTask[] {
  return [...tasks].sort((left, right) => left.id.localeCompare(right.id));
}

function sortIdMap(map: Record<TaskId, TaskId[]>): Record<TaskId, TaskId[]> {
  return Object.fromEntries(Object.entries(map).map(([id, ids]) => [id, [...ids].sort()]));
}

function detectDependencyCycles(tasksById: Record<TaskId, ParsedTask>): BoardIssue[] {
  const issues: BoardIssue[] = [];
  const visiting = new Set<TaskId>();
  const visited = new Set<TaskId>();
  const path: TaskId[] = [];

  const visit = (taskId: TaskId) => {
    if (visited.has(taskId)) {
      return;
    }

    if (visiting.has(taskId)) {
      const cycleStart = path.indexOf(taskId);
      const cycle = [...path.slice(cycleStart), taskId];
      issues.push({
        code: "dependency_cycle",
        message: `Dependency cycle detected: ${cycle.join(" -> ")}.`,
        severity: "error",
        taskId
      });
      return;
    }

    const task = tasksById[taskId];

    if (!task) {
      return;
    }

    visiting.add(taskId);
    path.push(taskId);

    task.depends_on.forEach((dependencyId) => visit(dependencyId));

    path.pop();
    visiting.delete(taskId);
    visited.add(taskId);
  };

  Object.keys(tasksById)
    .sort()
    .forEach((taskId) => visit(taskId));

  return issues;
}

