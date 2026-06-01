import { buildBoardIndex, type BoardFile } from "@duneboard/core";

export type BoardIndex = ReturnType<typeof buildBoardIndex>;

export type BoardProject = {
  id: string;
  isDefault?: boolean;
  name: string;
  root: string;
};

type ProjectsResponse = {
  projects: BoardProject[];
};

type BoardResponse = {
  files: BoardFile[];
  project: BoardProject;
};

export const emptyBoard = buildBoardIndex([]);

export async function fetchProjects(): Promise<BoardProject[]> {
  const response = await fetch("/api/projects");

  if (!response.ok) {
    throw new Error(`Failed to load projects: ${response.status}`);
  }

  const payload = (await response.json()) as ProjectsResponse;
  return payload.projects;
}

export async function fetchProjectBoard(projectId: string): Promise<{ board: BoardIndex; project: BoardProject }> {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/board`);

  if (!response.ok) {
    throw new Error(`Failed to load board: ${response.status}`);
  }

  const payload = (await response.json()) as BoardResponse;

  return {
    board: buildBoardIndex(payload.files),
    project: payload.project
  };
}
