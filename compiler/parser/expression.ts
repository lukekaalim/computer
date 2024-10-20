import { AST } from "./ast";
import { parseStatement } from "./statement";
import { TokenStream } from "./stream";

export const parseExpression = (stream: TokenStream): AST.Expression => {
  // see if there is an easy expression value. if so, return it.

  const firstValue =
    stream.tryFork(parseLiteral)
    || stream.tryFork(parseIdentifier)
    || stream.tryFork(parseFunction);

  if (!firstValue)
    throw new Error();

  const func = stream.tryFork(fork => parseCall(firstValue, fork));
  
  if (func)
    return func;
  
  const binary = stream.tryFork(fork => {
    // test to see if it's a binary expression
    const operator = parseOperator(fork);
    const right = parseExpression(fork);
    return AST.expression.binary(firstValue, right, operator);
  });

  if (binary)
    return binary;

  return firstValue;
};

const parseFunction = (stream: TokenStream) => {
  const args = parseFunctionArgs(stream);
  stream.assert('syntax', token => token.syntax === '=>');
  const body = parseFunctionBody(stream);
  return AST.expression.function(args, body);
}

const parseFunctionArgs = (stream: TokenStream) => {
  stream.assert('syntax', token => token.syntax === '(');
  const args: string[] = [];

  const first = stream.peek();
  if (first.type === 'syntax') {
    stream.assert('syntax', token => token.syntax === ')');
    return [];
  }


  while (true) {
    args.push(stream.assert('word').text);

    const end = stream.assert('syntax', token => token.syntax === ')' || token.syntax === ',');
    if (end.syntax === ')')
      return args;
  }
};
const parseFunctionBody = (stream: TokenStream) => {
  stream.assert('syntax', token => token.syntax === '{')
  const statements: AST.Statement[] = [];

  while (true) {
    const next = stream.peek();

    if (next.type === 'syntax' && next.syntax === '}')
      return (stream.read(), statements);

    statements.push(parseStatement(stream));
  }
};

const parseOperator = (stream: TokenStream): AST.Operator => {
  const token = stream.assert('syntax');
  switch (token.syntax) {
    case '+':
      return AST.operator.addition();
    case '-':
      return AST.operator.subtraction();
    default:
      throw new Error(`Syntax: "${token.syntax}" is not valid operator`)
  }
}

const parseLiteral = (stream: TokenStream): AST.LiteralExpression => {
  const token = stream.assert('primitive');

  if (typeof token.contents === 'string')
    return AST.expression.literal.string(token.contents);

  return AST.expression.literal.number(token.contents);
}

const parseIdentifier = (stream: TokenStream): AST.IdentifierExpression => {
  const token = stream.assert('word');
  return AST.expression.identifier(token.text);
}

const parsePostfixUnary = () => {

};

const validPrefixOperators = [
  'addition',
  'subtraction',
]

const parsePrefixUnary = (stream: TokenStream) => {
  const operator = parseOperator(stream);
}

const parseCall = (
  function_value: AST.Expression,
  stream: TokenStream
): AST.CallExpression => {
  stream.assert('syntax', token => token.syntax === '(');
  const args: AST.Expression[] = [];

  const first = stream.peek();
  if (first.type === 'syntax' && first.syntax === ')')
    return (stream.read(), AST.expression.call(function_value, args));

  while (true) {
    const arg = parseExpression(stream);
    args.push(arg);

    const next = stream.assert('syntax', token => token.syntax === ')' || token.syntax === ',');
    if (next.syntax === ',')
      continue;
    else
      return AST.expression.call(function_value, args);
  }
}