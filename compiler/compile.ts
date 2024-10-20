import { Executable } from "operating_system";

import { assemble } from "./link/assemble";
import { AssemblyDebug } from "./link/debug";

import { generateProgramIL, IL } from 'compiler/il';
import { Generator } from 'compiler/codegen';
import { read, Token } from 'compiler/lexer';
import { AST, parse } from 'compiler/parser';

export type CompilerDebug = {
  source_code: string,
  tokens: Token[],
  ast: AST,
  il: IL,
  exec_debug: AssemblyDebug,
};

export const compile = (source_code: string): [Executable, CompilerDebug] => {
  const tokens = read(source_code);
  const ast = parse(tokens);

  const il = generateProgramIL(ast);
  const gen = Generator.generate(il);
  
  const [executable, exec_debug] = assemble(gen);

  const debug = {
    source_code,
    tokens,
    ast,
    il,
    exec_debug,
  };

  return [executable, debug] as const;
}