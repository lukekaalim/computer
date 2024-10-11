import { parseTokens } from './parser';

export type AST = AST.Program;

export namespace AST {
  export type Common = {
    node_id?: string,
    //token_span: { start: number, end: number },
  }

  export type Program = Common & { type: 'program', statements: Statement[] }

  export type Statement =
    | DeclarationStatement

  export type DeclarationStatement = Common & {
    type: 'statement:declaration',
    identifier: string,
    init: Expression
  }

  export type Expression =
    | LiteralExpression
    | BinaryExpression
    | IdentifierExpression

  export type IdentifierExpression = Common & {
    type: 'expression:identifier',
    id: string,
  }

  export type LiteralExpression =
    | StringLiteralExpression
    | NumberLiteralExpression

  export type StringLiteralExpression = Common & {
    type: 'expression:literal:string',
    content: string,
  }
  export type NumberLiteralExpression = Common & {
    type: 'expression:literal:number',
    content: number,
  }

  export type BinaryExpression = Common & {
    type: 'expression:binary',
    left: Expression,
    right: Expression,
    operator: BinaryOperator
  }

  export type BinaryOperator =
    | Common & { type: 'multiplication' }
    | Common & { type: 'addition' }

  export type Any =
    | Program
    | Statement
    | Expression

  export const parse = parseTokens;
}
