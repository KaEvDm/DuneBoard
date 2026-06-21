import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadBoard } from "../src/board-files";

describe("loadBoard", () => {
  it("loads live task files recursively and ignores task-root archive subtrees", async () => {
    const root = await mkdtemp(path.join(tmpdir(), "duneboard-archive-"));

    try {
      await writeTask(root, "tasks/DB-0001-live.md", task("DB-0001"));
      await writeTask(root, "tasks/DB-0002-bundle/task.md", task("DB-0002"));
      await writeTask(root, "tasks/archive/DB-0001-archived-duplicate.md", task("DB-0001"));
      await writeTask(root, "tasks/archive/source-spec.md", "# Archived source spec\n\nNo task frontmatter here.\n");

      const board = await loadBoard(root);

      expect(board.files.map((file) => file.path)).toEqual([
        "tasks/DB-0001-live.md",
        "tasks/DB-0002-bundle/task.md"
      ]);
      expect(board.index.tasks.map((loadedTask) => loadedTask.id)).toEqual(["DB-0001", "DB-0002"]);
      expect(board.index.issues).toEqual([]);
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });
});

async function writeTask(root: string, relativePath: string, content: string): Promise<void> {
  const absolutePath = path.join(root, relativePath);
  await writeFile(absolutePath, content, { flag: "w" }).catch(async (error: unknown) => {
    if (isNodeError(error) && error.code === "ENOENT") {
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, content, { flag: "w" });
      return;
    }

    throw error;
  });
}

function task(id: string): string {
  return `---
id: ${id}
title: Task ${id}
kind: task
status: ready
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

## Acceptance Criteria

- [ ] Works
`;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
