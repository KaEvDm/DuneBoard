import { parseTaskFile } from "@duneboard/core";
import { describe, expect, it } from "vitest";
import { printTaskSummaryDetail, tailWorkLog, workLogEntries } from "../src/format";

describe("compact task formatting", () => {
  it("tails work-log entries without including full history", () => {
    const task = parsedTask(`## Work Log

- 2026-06-01: First entry.
- 2026-06-02: Second entry.
  Wrapped detail.
- 2026-06-03: Third entry.
`);

    expect(workLogEntries(task)).toEqual([
      "- 2026-06-01: First entry.",
      "- 2026-06-02: Second entry.\n  Wrapped detail.",
      "- 2026-06-03: Third entry."
    ]);
    expect(tailWorkLog(task, 2)).toEqual([
      "- 2026-06-02: Second entry.\n  Wrapped detail.",
      "- 2026-06-03: Third entry."
    ]);
  });

  it("handles missing work-log sections", () => {
    const task = parsedTask("");

    expect(tailWorkLog(task, 5)).toEqual([]);
  });

  it("prints summary output without design content or historical log", () => {
    const task = parsedTask(`## Design

Detailed implementation design.

## Work Log

- 2026-06-01: Old entry.
- 2026-06-02: Current entry.
`);

    const output = printTaskSummaryDetail(task, { logTail: 1 });

    expect(output).toContain("DB-0001 Example task");
    expect(output).toContain("Acceptance: 1/2 checked");
    expect(output).toContain("- 2026-06-02: Current entry.");
    expect(output).not.toContain("Detailed implementation design.");
    expect(output).not.toContain("- 2026-06-01: Old entry.");
  });
});

function parsedTask(extraSections: string) {
  const result = parseTaskFile(
    "tasks/DB-0001-example.md",
    `---
id: DB-0001
title: Example task
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

Exercise compact formatting.

## Acceptance Criteria

- [ ] Open item
- [x] Closed item

${extraSections}`
  );

  if (!result.ok) {
    throw new Error(result.issues.map((issue) => issue.message).join("\n"));
  }

  return result.task;
}
