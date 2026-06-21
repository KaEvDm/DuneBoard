import { parse as parseYaml } from "yaml";
import { ZodError } from "zod";
import {
  type AcceptanceItem,
  type BoardIssue,
  type ParsedTask,
  taskFrontmatterSchema
} from "./task-schema";

type FrontmatterParseResult = {
  ok: true;
  body: string;
  frontmatter: unknown;
};

type FrontmatterResult =
  | FrontmatterParseResult
  | { ok: false; issues: BoardIssue[] };

export type TaskParseResult =
  | { ok: true; task: ParsedTask }
  | { ok: false; issues: BoardIssue[] };

export function parseTaskFile(filePath: string, content: string): TaskParseResult {
  const frontmatter = parseFrontmatter(filePath, content);

  if (!frontmatter.ok) {
    return frontmatter;
  }

  const parsed = taskFrontmatterSchema.safeParse(frontmatter.frontmatter);

  if (!parsed.success) {
    return {
      ok: false,
      issues: zodIssuesToBoardIssues(filePath, parsed.error)
    };
  }

  const body = frontmatter.body.trim();
  const sections = parseSections(body);

  return {
    ok: true,
    task: {
      ...parsed.data,
      filePath,
      slug: slugFromFilePath(filePath, parsed.data.id),
      body,
      sections,
      acceptance: parseAcceptanceItems(sections["Acceptance Criteria"] ?? "")
    }
  };
}

function parseFrontmatter(filePath: string, content: string): FrontmatterResult {
  const normalized = content.replace(/^\uFEFF/, "");

  if (!normalized.startsWith("---\n")) {
    return {
      ok: false,
      issues: [
        {
          code: "missing_frontmatter",
          filePath,
          message: "Task file must start with YAML frontmatter.",
          severity: "error"
        }
      ]
    };
  }

  const endIndex = normalized.indexOf("\n---", 4);

  if (endIndex === -1) {
    return {
      ok: false,
      issues: [
        {
          code: "unclosed_frontmatter",
          filePath,
          message: "Task file frontmatter is not closed.",
          severity: "error"
        }
      ]
    };
  }

  try {
    return {
      ok: true,
      frontmatter: parseYaml(normalized.slice(4, endIndex)),
      body: normalized.slice(endIndex + 4)
    };
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          code: "invalid_yaml",
          filePath,
          message: error instanceof Error ? error.message : "Task frontmatter is invalid YAML.",
          severity: "error"
        }
      ]
    };
  }
}

function parseSections(body: string): Record<string, string> {
  const matches: Array<{ contentStart: number; headingStart: number; title: string }> = [];
  const sections: Record<string, string> = {};
  let activeFence: string | undefined;

  for (const match of body.matchAll(/[^\r\n]*(?:\r?\n|$)/g)) {
    if (match[0] === "" && match.index === body.length) {
      break;
    }

    const lineStart = match.index ?? 0;
    const rawLine = match[0];
    const line = rawLine.replace(/\r?\n$/, "");
    const fenceMatch = line.match(/^\s*(`{3,}|~{3,})/);

    if (fenceMatch) {
      const fenceMarker = fenceMatch[1];
      const fenceChar = fenceMarker?.[0];
      const activeFenceChar = activeFence?.[0];

      if (!activeFence && fenceMarker) {
        activeFence = fenceMarker;
      } else if (activeFence && fenceMarker && fenceChar === activeFenceChar && fenceMarker.length >= activeFence.length) {
        activeFence = undefined;
      }
    }

    if (activeFence) {
      continue;
    }

    const headingMatch = line.match(/^##\s+(.+?)\s*$/);
    const title = headingMatch?.[1]?.trim();

    if (title) {
      matches.push({
        title,
        headingStart: lineStart,
        contentStart: lineStart + rawLine.length
      });
    }
  }

  matches.forEach((match, index) => {
    const next = matches[index + 1];
    const contentEnd = next?.headingStart ?? body.length;
    sections[match.title] = body.slice(match.contentStart, contentEnd).trim();
  });

  return sections;
}

function parseAcceptanceItems(markdown: string): AcceptanceItem[] {
  return markdown
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*-\s+\[( |x|X)\]\s+(.+)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      checked: match[1]?.toLowerCase() === "x",
      text: match[2]?.trim() ?? ""
    }));
}

function slugFromFilePath(filePath: string, id: string): string {
  const normalized = filePath.replace(/\\/g, "/");
  const fileName = normalized.split("/").at(-1) ?? filePath;
  return fileName.replace(/\.md$/i, "").replace(new RegExp(`^${id}-?`), "");
}

function zodIssuesToBoardIssues(filePath: string, error: ZodError): BoardIssue[] {
  return error.issues.map((issue) => ({
    code: "invalid_frontmatter",
    filePath,
    message: `${issue.path.join(".") || "frontmatter"}: ${issue.message}`,
    severity: "error"
  }));
}
