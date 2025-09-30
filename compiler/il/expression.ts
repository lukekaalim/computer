import { Struct } from "../mod";
import { AST } from "../parser/ast";
import { id } from "../utils";

/**
 * To resolve an expression, often temporary data needs to be stored
 * on the stack
 */
export const buildExpressionStruct = (expression: AST.Expression) => {
  const valueCount = getExpressionIntermediateValueCount(expression);

  return Struct.define(
    id(`expression(${expression.node_id})`),
    [
      'destination_addr',
      ...Array.from({ length: valueCount })
        .map((_, i) => `intermediate_value_${i}`)
    ]
  )
};

/**
 * Expressions sometimes produce intermediate values.
 * This function counts how many intermediate values an expression needs.
 * 
 * @param expression
 * @returns 
 */
export const getExpressionIntermediateValueCount = (expression: AST.Expression): number => {
  switch (expression.type) {
    case 'expression:binary':
      return 1 + Math.min(
        getExpressionIntermediateValueCount(expression.left),
        getExpressionIntermediateValueCount(expression.right),
      );
    case 'expression:identifier':
    case 'expression:literal:number':
    case 'expression:literal:string':
    case 'expression:call':
      return 1;
    case 'expression:function':
      return 0;
  }
}