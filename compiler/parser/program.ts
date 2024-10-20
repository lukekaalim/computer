import { Token } from "../mod";
import { AST } from "./ast";
import { parseStatement } from "./statement";
import { TokenStream } from "./stream";

// A program is a linear list of statements and comments
export const parseProgram = (stream: TokenStream): AST.Program => {
  const statements: AST.Statement[] = [];
  const comments: Token.Comment[]  = [];
  
  while (true) {
    const current = stream.peek();

    if (current.type === 'end-of-file')
      break;
    else if (current.type === 'comment')
      comments.push((stream.read(), current));
    else
      statements.push(parseStatement(stream));
  }

  return AST.program(statements);
}