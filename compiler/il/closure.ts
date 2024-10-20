import { Struct } from "../mod";
import { AST } from "../parser/ast";

/**
 * Functions (or global scope) have a "Scope" struct
 * associated with them when they execute, storing
 * the variables defined by declaration statements.
 * 
 * 
 * @param name The name given to the scope struct
 * @param statements all the statements that contribute to
 * the scope
 * @returns 
 */
export const generateScopeStruct = (name: string, statements: AST.Statement[]): Struct => {
  const variable_names: string[] = [];

  for (const statement of statements) {
    if (statement.type === 'statement:declaration')
      variable_names.push(statement.identifier);
  }

  return Struct.define(name, variable_names);
};
