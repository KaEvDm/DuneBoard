import { buildBoardIndex, type BoardFile } from "@duneboard/core";

const modules = import.meta.glob("../../../tasks/*.md", {
  eager: true,
  import: "default",
  query: "?raw"
}) as Record<string, string>;

const files: BoardFile[] = Object.entries(modules)
  .map(([path, content]) => ({
    path: path.replace("../../../", ""),
    content
  }))
  .sort((left, right) => left.path.localeCompare(right.path));

export const board = buildBoardIndex(files);

