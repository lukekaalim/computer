import { Core, RegisterID } from "isa";
import { AST } from "../../ast/parser";
import { generateWriteStruct } from "../struct";

export const generateExpression = (
  expression: AST.Expression,
  destination_rid: RegisterID,
) => {
  switch (expression.type) {
    case 'expression:literal:number':
      return generateNumberLiteralExpression(expression, destination_rid);
    default:
      return []
  }
}

const generateNumberLiteralExpression = (
  literal_expression: AST.NumberLiteralExpression,
  destination_rid: RegisterID,
) => {
  return [
    Core.factory.put(literal_expression.content, destination_rid),
  ];
}