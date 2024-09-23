import { RegisterID } from "isa";
import { AST } from "../../ast/parser";
import { CodegenInstruction } from "../instructions";
import { generateExpression } from "./expression";
import { generateWriteStruct, StructDefinition } from "../struct";

export const generateStatement = (
  statement: AST.Statement,
  closure_rid: RegisterID,
  closure_struct: StructDefinition,
  temp_0_rid: RegisterID,
  temp_1_rid: RegisterID,
  temp_2_rid: RegisterID,
  temp_3_rid: RegisterID,
): CodegenInstruction[] => {
  switch (statement.type) {
    case 'statement:declaration':
      return generateDelcarationStatement(statement, closure_rid, closure_struct, temp_0_rid, temp_1_rid);
    default:
      return [];
  }
  return []
};

const generateDelcarationStatement = (
  statement: AST.DeclarationStatement,
  closure_rid: RegisterID,
  closure_struct: StructDefinition,
  
  temp_0_rid: RegisterID,
  temp_1_rid: RegisterID,
) => {
  return [
    ...generateExpression(statement.init, temp_0_rid),
    ...generateWriteStruct(
      closure_rid,
      temp_0_rid,
      temp_1_rid,
      closure_struct,
      statement.identifier,
    )
  ]
}
