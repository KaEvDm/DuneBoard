import { execFile as execFileCallback } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";

const execFile = promisify(execFileCallback);
const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../..");
const tsxCli = path.join(repoRoot, "node_modules", "tsx", "dist", "cli.mjs");
const cliEntry = path.join(repoRoot, "packages", "cli", "src", "index.ts");

describe("CLI compact views", () => {
  it("prints bounded ready queues and compact task context", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "duneboard-cli-"));

    try {
      await writeTask(root, "tasks/DB-0001-done.md", task("DB-0001", { status: "done" }));
      await writeTask(root, "tasks/DB-0002-ready.md", task("DB-0002"));
      await writeTask(root, "tasks/DB-0003-ready.md", task("DB-0003"));

      const nextJson = JSON.parse((await runCli(root, ["next", "--json", "--limit", "1"])).stdout);
      expect(nextJson).toHaveLength(1);
      expect(nextJson[0]).toMatchObject({ id: "DB-0002" });

      const nextText = (await runCli(root, ["next", "--limit", "1"])).stdout.trim();
      expect(nextText.split(/\r?\n/)).toHaveLength(1);
      expect(nextText).toContain("DB-0002");
      expect(nextText).not.toContain("DB-0003");

      const preflightCompact = (await runCli(root, ["preflight", "--compact", "--limit", "1"])).stdout.trim();
      expect(preflightCompact).toContain("OK 3 live tasks.");
      expect(preflightCompact).toContain("Next: DB-0002");
      expect(preflightCompact).not.toContain("DB-0003");

      const preflightJson = JSON.parse((await runCli(root, ["preflight", "--json", "--limit", "1"])).stdout);
      expect(preflightJson).toMatchObject({
        ok: true,
        validation: {
          liveTasks: 3,
          ignoredArchiveSubtrees: ["tasks/archive/**"],
          issues: []
        }
      });
      expect(preflightJson.next).toHaveLength(1);
      expect(preflightJson.next[0]).toMatchObject({ id: "DB-0002" });

      const summary = (await runCli(root, ["show", "DB-0001", "--summary", "--log-tail", "2"])).stdout;
      expect(summary).toContain("Acceptance: 1/2 checked");
      expect(summary).toContain("- 2026-06-02: Continued work.");
      expect(summary).toContain("- 2026-06-03: Finished work.");
      expect(summary).not.toContain("- 2026-06-01: Started work.");
      expect(summary).not.toContain("Full design content.");

      const summaryJson = JSON.parse(
        (await runCli(root, ["show", "DB-0001", "--summary", "--json", "--log-tail", "2"])).stdout
      );
      expect(summaryJson).toMatchObject({
        id: "DB-0001",
        acceptance: { checked: 1, total: 2 },
        goal: "Test task."
      });
      expect(summaryJson.workLog).toEqual([
        "- 2026-06-02: Continued work.",
        "- 2026-06-03: Finished work."
      ]);

      const logText = (await runCli(root, ["task", "log", "DB-0001", "--tail", "2"])).stdout.trim();
      expect(logText).toBe("- 2026-06-02: Continued work.\n- 2026-06-03: Finished work.");

      const logJson = JSON.parse((await runCli(root, ["task", "log", "DB-0001", "--tail", "2", "--json"])).stdout);
      expect(logJson).toMatchObject({
        id: "DB-0001",
        filePath: "tasks/DB-0001-done.md",
        workLog: ["- 2026-06-02: Continued work.", "- 2026-06-03: Finished work."]
      });
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});

async function runCli(root: string, args: string[]): Promise<{ stdout: string; stderr: string }> {
  return execFile(process.execPath, [tsxCli, cliEntry, "--root", root, ...args], {
    cwd: repoRoot,
    maxBuffer: 1024 * 1024
  });
}

async function writeTask(root: string, relativePath: string, content: string): Promise<void> {
  const absolutePath = path.join(root, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

function task(id: string, options: { status?: string } = {}): string {
  return `---
id: ${id}
title: Task ${id}
kind: task
status: ${options.status ?? "ready"}
priority: P1
parent: null
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [test]
---

## Goal

Test task.

## Design

Full design content.

## Acceptance Criteria

- [ ] Open item
- [x] Closed item

## Work Log

- 2026-06-01: Started work.
- 2026-06-02: Continued work.
- 2026-06-03: Finished work.
`;
}
