import { Executable } from "operating_system";

import { assemble } from "./link/assemble";
import { AssemblyDebug } from "./link/debug";

import { generateProgramIL, IL } from 'compiler/il';
import { Generator } from 'compiler/codegen';
import { Token, AST, ASTDebug } from 'compiler/ast';
import {} from 'compiler/link';

export type CompilerDebug = {
  ast_debug: ASTDebug,
  ast: AST.Program,
  il: IL.Node,
  exec_debug: AssemblyDebug,
};

export const compile = (source_code: string): [Executable, CompilerDebug] => {
  const tokens = Token.read(source_code);
  const ast = AST.parse(tokens);

  const il = generateProgramIL(ast);
  const gen = Generator.generate(il);
  
  const [executable, exec_debug] = assemble(gen);

  const debug = {
    ast_debug: {
      tokens
    },
    ast,
    il,
    exec_debug,
  };

  return [executable, debug] as const;
}