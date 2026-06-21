import { Command } from "commander";
import path from "node:path";
import { taskKindSchema, taskPrioritySchema, taskStatusSchema, type ParsedTask } from "@duneboard/core";
import {
  appendWorkLog,
  addTaskDependencies,
  createTaskFile,
  loadBoard,
  parseDependsOn,
  parseLabels,
  readTaskFile,
  setTaskStatus,
  updateTaskFields,
  writeTaskFile
} from "./board-files";
import { printIssues, printTask, printTaskDesign, printTaskDetail, taskById, toTaskSummary } from "./format";

const program = new Command();

program
  .name("duneboard")
  .description("Local-first task graph CLI for agents and humans.")
  .option("-r, --root <path>", "board root directory", process.env.INIT_CWD ?? process.cwd());

program
  .command("validate")
  .description("Validate task files and graph links.")
  .option("--json", "print JSON output")
  .action(async (options) => {
    const board = await loadBoard(rootOption());

    if (options.json) {
      printJson({
        ok: board.index.issues.length === 0,
        liveTasks: board.index.tasks.length,
        ignoredArchiveSubtrees: archiveSubtrees(board),
        issues: board.index.issues
      });
      return;
    }

    if (board.index.issues.length === 0) {
      console.log(`OK ${board.index.tasks.length} live tasks validated.`);
      console.log(`Ignored archive subtrees: ${archiveSubtrees(board).join(", ")}`);
      return;
    }

    console.error(printIssues(board.index.issues));
    process.exitCode = 1;
  });

program
  .command("next")
  .description("Print tasks that are ready and have completed dependencies.")
  .option("--json", "print JSON output")
  .action(async (options) => {
    const board = await loadBoard(rootOption());
    const tasks = board.index.availableTaskIds.map((id) => taskById(board.index.tasksById, id));

    if (options.json) {
      printJson(tasks.map(toTaskSummary));
      return;
    }

    if (tasks.length === 0) {
      console.log("No available tasks.");
      return;
    }

    console.log(tasks.map(printTask).join("\n"));
  });

program
  .command("list")
  .description("List tasks.")
  .option("-s, --status <status>", "filter by task status")
  .option("--json", "print JSON output")
  .action(async (options) => {
    const status = options.status ? taskStatusSchema.parse(options.status) : undefined;
    const board = await loadBoard(rootOption());
    const tasks = board.index.tasks.filter((task) => !status || task.status === status);

    if (options.json) {
      printJson(tasks.map(toTaskSummary));
      return;
    }

    console.log(tasks.length ? tasks.map(printTask).join("\n") : "No matching tasks.");
  });

program
  .command("show")
  .description("Show a task detail.")
  .argument("<id>", "task ID")
  .option("--with-design", "include design content in the detail output")
  .option("--design", "print only the design content")
  .option("--json", "print JSON output")
  .action(async (id, options) => {
    const board = await loadBoard(rootOption());
    const task = taskById(board.index.tasksById, id);

    if (options.json) {
      printJson(task);
      return;
    }

    if (options.design) {
      console.log(printTaskDesign(task));
      return;
    }

    console.log(printTaskDetail(task, { includeDesign: options.withDesign }));
  });

const task = program.command("task").description("Create and update tasks.");

task
  .command("create")
  .description("Create a task Markdown file.")
  .requiredOption("-t, --title <title>", "task title")
  .option("-k, --kind <kind>", "task kind", "task")
  .option("-s, --status <status>", "initial task status", "draft")
  .option("-p, --priority <priority>", "task priority", "P2")
  .option("--parent <id>", "parent task ID")
  .option("--depends-on <id...>", "dependency task IDs; comma-separated values are also supported")
  .option("-l, --label <label...>", "task labels; comma-separated values are also supported")
  .option("--json", "print JSON output")
  .action(async (options) => {
    const kind = taskKindSchema.parse(options.kind);
    const status = taskStatusSchema.parse(options.status);
    const priority = taskPrioritySchema.parse(options.priority);
    const dependsOn = parseDependsOn(options.dependsOn);
    const board = await loadBoard(rootOption());

    if (options.parent) {
      taskById(board.index.tasksById, options.parent);
    }

    dependsOn.forEach((dependencyId) => taskById(board.index.tasksById, dependencyId));

    const created = await createTaskFile({
      root: rootOption(),
      title: options.title,
      kind,
      status,
      priority,
      parent: options.parent ?? null,
      dependsOn,
      labels: parseLabels(options.label)
    });

    if (options.json) {
      printJson(created);
      return;
    }

    console.log(`Created ${created.id} at ${created.filePath}`);
  });

task
  .command("link")
  .description("Add dependency links to an existing task.")
  .argument("<id>", "task ID")
  .requiredOption("--depends-on <id...>", "dependency task IDs; comma-separated values are also supported")
  .action(async (id, options) => {
    const dependencyIds = parseDependsOn(options.dependsOn);
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    dependencyIds.forEach((dependencyId) => taskById(board.index.tasksById, dependencyId));

    const content = await readTaskFile(board.root, selectedTask);
    const withDependencies = addTaskDependencies(content, dependencyIds);
    const updated = appendWorkLog(withDependencies, `Linked dependencies: ${dependencyIds.join(", ")}.`);
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Linked ${selectedTask.id} to ${dependencyIds.join(", ")}`);
  });

task
  .command("note")
  .description("Append a work-log note to a task.")
  .argument("<id>", "task ID")
  .argument("<note...>", "note text")
  .action(async (id, noteParts: string[]) => {
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    const content = await readTaskFile(board.root, selectedTask);
    const updated = appendWorkLog(content, noteParts.join(" "));
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Updated ${selectedTask.id}`);
  });

task
  .command("claim")
  .description("Claim a task for an agent and move it to in_progress.")
  .argument("<id>", "task ID")
  .requiredOption("-a, --agent <agent>", "agent name or ID")
  .action(async (id, options) => {
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    const content = await readTaskFile(board.root, selectedTask);
    const withClaim = updateTaskFields(content, {
      assignee: options.agent,
      status: "in_progress",
      updated_at: new Date().toISOString()
    });
    const updated = appendWorkLog(withClaim, `Claimed by ${options.agent}.`);
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Claimed ${selectedTask.id} for ${options.agent}`);
  });

task
  .command("release")
  .description("Release a task back to ready by default.")
  .argument("<id>", "task ID")
  .option("-s, --status <status>", "status after release", "ready")
  .action(async (id, options) => {
    const status = taskStatusSchema.parse(options.status);
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    const content = await readTaskFile(board.root, selectedTask);
    const withRelease = updateTaskFields(content, {
      assignee: null,
      status,
      updated_at: new Date().toISOString()
    });
    const updated = appendWorkLog(withRelease, `Released with status ${status}.`);
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Released ${selectedTask.id} to ${status}`);
  });

task
  .command("done")
  .description("Mark a task done and append a completion summary.")
  .argument("<id>", "task ID")
  .requiredOption("-s, --summary <summary>", "completion summary")
  .action(async (id, options) => {
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    const content = await readTaskFile(board.root, selectedTask);
    const withDone = updateTaskFields(content, {
      assignee: null,
      status: "done",
      updated_at: new Date().toISOString()
    });
    const updated = appendWorkLog(withDone, `Completed. ${options.summary}`);
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Completed ${selectedTask.id}`);
  });

task
  .command("set-status")
  .description("Set task status.")
  .argument("<id>", "task ID")
  .argument("<status>", "new status")
  .action(async (id, statusInput) => {
    const status = taskStatusSchema.parse(statusInput);
    const board = await loadBoard(rootOption());
    const selectedTask = taskById(board.index.tasksById, id);
    const content = await readTaskFile(board.root, selectedTask);
    const updated = setTaskStatus(content, status);
    await writeTaskFile(board.root, selectedTask, updated);
    console.log(`Set ${selectedTask.id} to ${status}`);
  });

program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
}

function rootOption(): string {
  return program.opts<{ root: string }>().root;
}

function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}

function archiveSubtrees(board: Awaited<ReturnType<typeof loadBoard>>): string[] {
  return board.archiveDirs.map((archiveDir) => `${pathRelative(board.root, archiveDir)}/**`);
}

function pathRelative(root: string, absolutePath: string): string {
  return path.relative(root, absolutePath).replace(/\\/g, "/");
}
