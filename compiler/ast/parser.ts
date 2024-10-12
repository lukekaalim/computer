import { id } from "../utils";
import { Chars } from "./chars";
import { AST } from "./nodes";
import { Token } from "./token";

type TokenStream = {
  read(): Token.Any,
  assert<T extends Token.Any["type"]>(type: T, test: (token: Extract<Token.Any, { type: T}>) => boolean): void,
}

namespace TokenStream {
  export const create = (tokens: Token.Any[]): TokenStream => {
    let index = 0;

    const stream: TokenStream = {
      read() {
        index++;
        return tokens[index];
      },
      assert(type, test) {
        const token = stream.read()
        if (token.type !== type)
          throw new Error();
        if (test(token as any))
          return;
        throw new Error();
      },
    }
    return stream;
  }
}

export const parseTokens = (tokens: Token.Any[]) => {
  let index = 0;

  const readNextToken = () => {
    index++;
    return tokens[index];
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

  // read tokens until the end of the statement
  const collectExpressionTokens = () => {
    const expression_tokens: Token.Any[] = [];
    while (true) {
      const token = readNextToken();

      if (token.type === 'syntax' && token.syntax === ';')
        return expression_tokens;
    }
  }

  const tryReadFunction = (stream: TokenStream) => {
    const firstToken = stream.read();
    
    if (firstToken.type === 'word') {
      stream.assert('syntax', s => s.syntax === '=>')
    } else if (firstToken.type === 'syntax' && firstToken.syntax === '(') {

    }

    throw new Error();
  }

  const readExpression2 = (stream: TokenStream) => {
    // try read unary
    // try read binary
  };

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
              pendingExpression = { node_id: id('number'), type: 'expression:literal:number', content: token.contents }
              break;
            case 'string':
              pendingExpression = { node_id: id('string'), type: 'expression:literal:string', content: token.contents }
              break;
          }
          break;
        case 'syntax':
          switch (token.syntax) {
            case '+': {
              const left = pendingExpression || { node_id: id('number'), type: 'expression:literal:number', content: 0 };
              const operator = { node_id: id('addition'), type: 'addition' } as const;
              const right = readExpression();
              return { node_id: id('binary'), type: 'expression:binary', left, right, operator };
            }
            case '*': {
              if (!pendingExpression)
                throw new Error('Unexpected unary operator: "*"');
              const left = pendingExpression;
              const operator = { node_id: id('multiplication'), type: 'multiplication' } as const;
              const right = readExpression();
              return { node_id: id('binary'), type: 'expression:binary', left, right, operator };
            }
            default:
              throw new Error(`Unsupported syntax in expression: "${token.syntax}"`)
          }
          case 'word': {
            pendingExpression = { node_id: id('identifier'), type: 'expression:identifier', id: token.text };
            break;
          }
          default:
            throw new Error(`Unsupported token in expression: "${token.type}"`)
      }
      expression_tokens.push(token);
    }

    if (!pendingExpression)
      throw new Error(`Not enough tokens to make an expression`);

    return pendingExpression;
  };

  const readDeclaration = (): AST.DeclarationStatement => {
    const identifier = readNextWord().text;
    readNextSyntax('=');
    const init = readExpression();
    return {
      node_id: id('declaration'),
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
      case 'comment':
        return readStatement();
      default:
        console.log(token)
        throw new Error(`Syntax Error: Unexpected Token: "${token.type}" (expected word or newline)`)
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
    return { node_id: id('program'), type: 'program', statements }
  }

  return readProgram();
}