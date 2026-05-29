import { describe, expect, it } from "vitest";
import { parseTaskFile } from "../src";

describe("parseTaskFile", () => {
  it("parses frontmatter, sections, and acceptance criteria", () => {
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
labels: [core]
---

## Goal

Parse this file.

## Acceptance Criteria

- [ ] First criterion
- [x] Completed criterion
`
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.task.id).toBe("DB-0001");
    expect(result.task.sections.Goal).toBe("Parse this file.");
    expect(result.task.acceptance).toEqual([
      { checked: false, text: "First criterion" },
      { checked: true, text: "Completed criterion" }
    ]);
  });
});

