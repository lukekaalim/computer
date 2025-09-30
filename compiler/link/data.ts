import { IL } from "../mod";

export type DataTable = {
  ids: string[],
  offsetsById: Map<string, number>;
  sizesById: Map<string, number>,
  totalSize: number,
}

export const createDataTable = (dataNodes: IL.DataNode[]): DataTable => {
  let offset = 0;
  const offsetsById = new Map<string, number>();
  const sizesById = new Map<string, number>();
  const ids = [];

  for (const node of dataNodes) {
    ids.push(node.id);
    offsetsById.set(node.id, offset);
    sizesById.set(node.id, node.contents.length);
    // an IL expression evaluates to exactly one word,
    offset += node.contents.length;
  }

  return { offsetsById, totalSize: offset, ids, sizesById };
};
