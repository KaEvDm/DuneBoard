declare module "virtual:duneboard-board" {
  import type { BoardFile } from "@duneboard/core";

  export const boardRoot: string;
  export const files: BoardFile[];
}
