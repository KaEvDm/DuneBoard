import { describe, expect, it } from "vitest";
import { buildBoardIndex } from "../src";

type TaskFixtureOptions = {
  dependsOn?: string[];
  kind?: string;
  status?: string;
};

const task = (id: string, options: TaskFixtureOptions = {}) => `---
id: ${id}
title: Task ${id}
kind: ${options.kind ?? "task"}
status: ${options.status ?? "ready"}
priority: P1
parent: null
depends_on: [${options.dependsOn?.join(", ") ?? ""}]
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

describe("buildBoardIndex", () => {
  it("builds available and dependency-blocked queues", () => {
    const board = buildBoardIndex([
      {
        path: "tasks/DB-0001-root.md",
        content: task("DB-0001", { status: "done" })
      },
      {
        path: "tasks/DB-0002-ready.md",
        content: task("DB-0002", { dependsOn: ["DB-0001"] })
      },
      {
        path: "tasks/DB-0003-blocked.md",
        content: task("DB-0003", { dependsOn: ["DB-0002"] })
      }
    ]);

    expect(board.issues).toEqual([]);
    expect(board.availableTaskIds).toEqual(["DB-0002"]);
    expect(board.dependencyBlockedTaskIds).toEqual(["DB-0003"]);
  });

  it("reports missing dependencies", () => {
    const board = buildBoardIndex([
      {
        path: "tasks/DB-0001-missing.md",
        content: task("DB-0001", { dependsOn: ["DB-9999"] })
      }
    ]);

    expect(board.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "missing_dependency",
          taskId: "DB-0001"
        })
      ])
    );
  });

  it("reports dependency cycles", () => {
    const board = buildBoardIndex([
      {
        path: "tasks/DB-0001-a.md",
        content: task("DB-0001", { dependsOn: ["DB-0002"] })
      },
      {
        path: "tasks/DB-0002-b.md",
        content: task("DB-0002", { dependsOn: ["DB-0001"] })
      }
    ]);

    expect(board.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "dependency_cycle"
        })
      ])
    );
  });

  it("excludes epics and features from the available execution queue", () => {
    const board = buildBoardIndex([
      {
        path: "tasks/DB-0001-epic.md",
        content: task("DB-0001", { kind: "epic" })
      },
      {
        path: "tasks/DB-0002-feature.md",
        content: task("DB-0002", { kind: "feature" })
      },
      {
        path: "tasks/DB-0003-task.md",
        content: task("DB-0003")
      }
    ]);

    expect(board.availableTaskIds).toEqual(["DB-0003"]);
  });
});
