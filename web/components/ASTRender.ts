import { h } from "preact";
import { AST } from 'compiler/parser';
import { Span } from 'compiler/codegen';

export type ASTRenderProps = {
  program: AST.Program,
  spans: Span[],
  instruction_index: number,
};

export const ASTRender = ({ program, instruction_index, spans }: ASTRenderProps) => {
  const all_nodes = flattenNodes(program);

  return h('ol', {}, all_nodes.map(node => {
    return h('li', {
      style: { marginLeft: `${node.depth * 8}px`}
    }, h(ASTEntry, { node, span: spans.find(s => s.id === `ast:${node.node_id}`), instruction_index }))
  }))
};

const ASTEntry = ({ node, span, instruction_index }: { node: (AST.Any & { depth: number }), span?: Span, instruction_index: number }) => {
  const active = span && (
    span.start <= instruction_index &&
    span.end > instruction_index
  )

  return h('pre', {
    style: { fontWeight: active ? 'bold' : 'normal' }
  }, node.type + ` id=[${node.node_id}]`);
}

const flattenNodes = (node: AST.Any, depth: number = 0): (AST.Any & { depth: number })[] => {
  const children = getChildren(node);
  return [{ ...node, depth }, ...children.map(c => flattenNodes(c, depth + 1)).flat(1)];
}

const getChildren = (node: AST.Any): AST.Any[] => {
  switch (node.type) {
    case 'expression:binary':
      return [node.left, node.right];
    case 'expression:identifier':
    case 'expression:literal:number':
    case 'expression:literal:string':
      return [];
    case 'statement:declaration':
      return [node.init];
    case 'program':
      return node.statements;
    case 'expression:function':
      return node.body;
    default:
      throw new Error(`Unknown child`);
  }
}
