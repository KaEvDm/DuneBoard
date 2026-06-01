import { buildBoardIndex, type BoardFile } from "@duneboard/core";
import { boardRoot, files as virtualFiles } from "virtual:duneboard-board";

const files: BoardFile[] = virtualFiles;

export { boardRoot };
export const board = buildBoardIndex(files);
