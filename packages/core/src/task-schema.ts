import { z } from "zod";

export const taskIdSchema = z.string().regex(/^DB-\d{4}$/, "Task ID must look like DB-0001");

export const taskKindSchema = z.enum([
  "epic",
  "feature",
  "story",
  "task",
  "bug",
  "spike",
  "chore",
  "decision"
]);

export const taskStatusSchema = z.enum([
  "draft",
  "ready",
  "in_progress",
  "blocked",
  "review",
  "done",
  "canceled"
]);

export const taskPrioritySchema = z.enum(["P0", "P1", "P2", "P3", "P4"]);

export const taskFrontmatterSchema = z.object({
  id: taskIdSchema,
  title: z.string().min(1),
  kind: taskKindSchema,
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  parent: taskIdSchema.nullable(),
  depends_on: z.array(taskIdSchema).default([]),
  blocked_by: z.array(z.string()).default([]),
  relates_to: z.array(taskIdSchema).default([]),
  assignee: z.string().nullable().default(null),
  labels: z.array(z.string()).default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type TaskId = z.infer<typeof taskIdSchema>;
export type TaskKind = z.infer<typeof taskKindSchema>;
export type TaskStatus = z.infer<typeof taskStatusSchema>;
export type TaskPriority = z.infer<typeof taskPrioritySchema>;
export type TaskFrontmatter = z.infer<typeof taskFrontmatterSchema>;

export type AcceptanceItem = {
  checked: boolean;
  text: string;
};

export type ParsedTask = TaskFrontmatter & {
  filePath: string;
  slug: string;
  body: string;
  sections: Record<string, string>;
  acceptance: AcceptanceItem[];
};

export type BoardIssueSeverity = "error" | "warning";

export type BoardIssue = {
  code: string;
  message: string;
  severity: BoardIssueSeverity;
  filePath?: string;
  taskId?: string;
};

