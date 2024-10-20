import { Token } from "compiler/lexer";
import { AST } from "./ast";
import { parseProgram } from "./program";
import { createTokenStream } from "./stream";

export const parse = (tokens: Token.Any[]): AST => {
  return parseProgram(createTokenStream(tokens));
}