import { ASTDebug } from "./debug";
import { lex } from "./lexer";
import { AST, parse } from "./parser";

export const readProgram = (source_code: string): [AST.Program, ASTDebug] => {
  const tokens = lex(source_code);
  const ast = parse(tokens);

  const debug = {
    source_code,
    tokens
  }

  return [ast, debug]
}