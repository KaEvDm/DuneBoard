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

## Design

Keep design content with the task.

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
    expect(result.task.sections.Design).toBe("Keep design content with the task.");
    expect(result.task.acceptance).toEqual([
      { checked: false, text: "First criterion" },
      { checked: true, text: "Completed criterion" }
    ]);
  });

  it("preserves design markdown with disclosure blocks", () => {
    const result = parseTaskFile(
      "tasks/DB-0002-design.md",
      `---
id: DB-0002
title: Design task
kind: decision
status: ready
priority: P0
parent: null
depends_on: []
blocked_by: []
relates_to: []
assignee: null
labels: [schema]
---

## Goal

Decide the format.

## Design

Current design summary.

<details>
<summary>Full design</summary>

### Alternatives

- Keep task-owned docs
- Link archived specs

\`\`\`md
## Embedded section heading
\`\`\`

~~~ts
const section = "Design";
~~~

</details>

## Acceptance Criteria

- [ ] Decision is documented
`
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.task.sections.Design).toBe(`Current design summary.

<details>
<summary>Full design</summary>

### Alternatives

- Keep task-owned docs
- Link archived specs

\`\`\`md
## Embedded section heading
\`\`\`

~~~ts
const section = "Design";
~~~

</details>`);
  });
});
