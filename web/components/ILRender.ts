import { useMemo } from "preact/hooks";
import { IL } from "../../compiler/il/nodes";
import { h } from "preact";

export type ILRenderProps = {
  root: IL.Node,
};

export const ILRender = ({ root }: ILRenderProps) => {
  const nodes = useMemo(() => {
    return flattenIL(root);
  }, [root]);

  return h('ol', {}, nodes.map(node => {
    return h('li', { style: { marginLeft: node.depth * 8 + 'px' }}, [
      node.type === 'label' ? `label(${node.id})` : node.type
    ]);
  }));
}

const flattenIL = (
  node: IL.Node,
  depth: number = 0,
  path: string[] = []
): (IL.Node & { depth: number, path: string[] })[] => {
  const node_with_position = { ...node, depth, path };
  const descend = (child: IL.Node, path_part: string) => {
    return flattenIL(child, depth + 1, [...path, path_part])
  }

  switch (node.type) {
    case 'borrow-register':
      return [
        node_with_position,
        descend(node.withRegister, `borrow(${node.id})`),
      ].flat(1)
    case 'list':
      return [
        node_with_position,
        ...node.nodes.flatMap((node, i) => descend(node, `[${i}]`))
      ];
    case 'label':
      return [
        node_with_position,
        descend(node.withLabel, `label(${node.id})`),
      ].flat(1);
    case 'instruction':
      return [node_with_position];
    case 'stack':
      return [
        node_with_position,
        descend(node.withStackedValue, `stack(${node.label})`),
      ].flat(1);
    case 'island':
      return [
        node_with_position,
        ...descend(node.contents, `island`)
      ]
    default:
      throw new Error(`Cannot flatten node: "${node.type}"`)
  }
}
