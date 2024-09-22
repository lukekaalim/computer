import { Executable } from "operating_system";
import { ASTDebug } from "./ast/debug";
import { readProgram } from "./ast/read"
import { generateProgram } from "./codegen/program";
import { assemble } from "./link/assemble";
import { AssemblyDebug } from "./link/debug";

export type CompilerDebug = {
  ast_debug: ASTDebug,
  exec_debug: AssemblyDebug,
};

export const compile = (source_code: string): [Executable, CompilerDebug] => {
  const [ast, ast_debug] = readProgram(source_code);
  const instructions = generateProgram(ast);
  const [executable, exec_debug] = assemble(instructions);

  const debug = {
    ast_debug,
    exec_debug,
  };

  return [executable, debug] as const;
}