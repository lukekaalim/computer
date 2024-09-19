import { Chars, Token } from "./token";

namespace AST {
  export type Program = { type: 'program', statements: Statement[] }

  export type Statement =
    | DeclarationStatement

  export type DeclarationStatement = {
    type: 'statement:declaration',
    identifier: string,
    init: Expression
  }

  export type Expression =
    | LiteralExpression
    | BinaryExpression

  export type LiteralExpression =
    | StringLiteralExpression
    | NumberLiteralExpression

  export type StringLiteralExpression = {
    type: 'expression:literal:string',
    content: string,
  }
  export type NumberLiteralExpression = {
    type: 'expression:literal:number',
    content: number,
  }

  export type BinaryExpression = {
    type: 'expression:binary',
    left: Expression,
    right: Expression,
    operator: BinaryOperator
  }

  export type BinaryOperator =
    | { type: 'multiplication' }
    | { type: 'addition' }
}

export const createSyntaxTree = (tokens: Token.Any[]) => {
  let index = 0;

  const readNextToken = () => {
    index++;
    return tokens[index];
  }
  const peekNextToken = () => {
    return tokens[index + 1];
  }

  const readNextWord = () => {
    const token = readNextToken()
    if (token.type !== 'word')
      throw new Error(`Syntax Error: Unexpected Token "${token.type}" (expected word)`)
    return token;
  }
  const readNextSyntax = (syntax: null | Chars.Syntax = null) => {
    const token = readNextToken()
    if (token.type !== 'syntax')
      throw new Error(`Syntax Error: Unexpected Token ${token.type} (expected syntax)`)

    if (syntax && token.syntax !== syntax)
      throw new Error(`Syntax Error: Unexpected Syntax ${token.syntax} (expected ${syntax})`)
    return token;
  }

  const readExpression = (): AST.Expression => {
    const expression_tokens: Token.Any[] = [];
    let pendingExpression: null | AST.Expression = null;

    while (true) {
      const token = readNextToken()
      if (token.type === 'syntax' && token.syntax === ';')
        break;
      if (token.type === 'newline')
        break;

      switch (token.type) {
        case 'primitive':
          switch (typeof token.contents) {
            case 'number':
              pendingExpression = { type: 'expression:literal:number', content: token.contents }
              break;
            case 'string':
              pendingExpression = { type: 'expression:literal:string', content: token.contents }
              break;
          }
          break;
        case 'syntax':
          switch (token.syntax) {
            case '+': {
              const left = pendingExpression || { type: 'expression:literal:number', content: 0 };
              const operator = { type: 'addition' } as const;
              const right = readExpression();
              return { type: 'expression:binary', left, right, operator };
            }
            case '*': {
              if (!pendingExpression)
                throw new Error('Unexpected unary operator: "*"');
              const left = pendingExpression;
              const operator = { type: 'multiplication' } as const;
              const right = readExpression();
              return { type: 'expression:binary', left, right, operator };
            }
          }
      }
      expression_tokens.push(token);
    }

    return pendingExpression || { type: 'expression:literal:number', content: 10 };
  };

  const readDeclaration = (): AST.DeclarationStatement => {
    const identifier = readNextWord().text;
    readNextSyntax('=');
    const init = readExpression();
    return {
      type: 'statement:declaration',
      identifier,
      init,
    }
  }

  const readStatement = () => {
    const token = readNextToken();
    switch (token.type) {
      case 'newline':
        return readStatement();
      case 'end-of-file':
        return null;
      case 'word':
        if (token.text !== 'const')
          throw new Error(`Unexpected Word ${token.text}`);
    
        return readDeclaration();
      default:
        console.log(token)
        throw new Error(`Syntax Error: Unexpected Token ${token.type} (expected word or newline)`)
    }
  }

  const readProgram = (): AST.Program => {
    const statements = [];
    while (true) {
      const statement = readStatement();
      if (statement)
        statements.push(statement);
      else
        break;
    }
    return { type: 'program', statements }
  }

  return { readProgram }
}