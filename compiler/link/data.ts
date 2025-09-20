import { IL } from "../mod";

export type DataTable = {
  offsetsById: Map<string, number>;
  totalSize: number,
}

export const createDataTable = (dataNodes: IL.DataNode[]): DataTable => {
  let offset = 0;
  const offsetsById = new Map<string, number>();

  for (const node of dataNodes) {
    offsetsById.set(node.id, offset);
    // an IL expression evaluates to exactly one word,
    offset += node.contents.length;
  }

  return { offsetsById, totalSize: offset };
};
