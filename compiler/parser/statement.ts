import { AST } from "./ast";
import { parseExpression } from "./expression";
import { TokenStream } from "./stream";

export const parseStatement = (stream: TokenStream): AST.Statement => {
  // only one type of statement so far.
  const declr = stream.tryFork(parseDeclarationStatement);
  if (declr)
    return declr;
  const expr = stream.tryFork(parseExpressionStatement);
  if (expr)
    return expr;

  throw new Error();
};

const declaration_keywords = [
  'const',
  'let',
];

const parseDeclarationStatement = (stream: TokenStream): AST.DeclarationStatement => {
  const _ = stream.assert('word', token =>
    declaration_keywords.includes(token.text));

  const identifier_token = stream.assert('word');
  
  stream.assert('syntax', token => token.syntax === '=');

  const expression = parseExpression(stream);

  stream.assert('syntax', token => token.syntax === ';');

  return AST.statement.declaration(identifier_token.text, expression);
}

const parseExpressionStatement = (stream: TokenStream): AST.ExpressionStatement => {
  const expr = parseExpression(stream);
  stream.assert('syntax', token => token.syntax === ';');
  return AST.statement.expression(expr);
}
