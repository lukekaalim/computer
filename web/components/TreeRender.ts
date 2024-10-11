import { ComponentChildren } from "preact";

export type TreeRenderProps<T> = {
  root: T,

  getChildren: (node: T) => T[],
  renderNode: (node: T) => ComponentChildren
};

export const TreeRender = <T>({
  root,
  getChildren,
  renderNode
}: TreeRenderProps<T>) => {
  
};

const NodeRender = () => {

};