import { id } from "../utils";

export type AST = AST.Program;

export namespace AST {
  type Node<Type extends string, Props extends {} = {}> = {
    node_id?: string,
    type: Type,
  } & Props;


  export type Program = Node<"program", { statements: Statement[] }>;

  export const program = (statements: Statement[]): Program => ({
    node_id: id('program'),
    type: 'program',
    statements,
  })

  export type Statement =
    | DeclarationStatement
    | ExpressionStatement

  export type DeclarationStatement = Node<'statement:declaration', {
    identifier: string,
    init: Expression
  }>
  export type ExpressionStatement = Node<'statement:expression', {
    expr: Expression
  }>

  export const statement = {
    declaration: (identifier: string, init: Expression): DeclarationStatement => ({
      type: 'statement:declaration',

      node_id: id('statement:declaration'),
      identifier,
      init,
    }),
    expression: (expr: Expression): ExpressionStatement => ({
      type: 'statement:expression',
      node_id: id('statement:expression'),
      expr,
    })
  }

  export type Expression =
    | LiteralExpression
    | BinaryExpression
    | IdentifierExpression
    | CallExpression
    | FunctionExpression

  export const expression = {
    literal: {
      number: (content: number): NumberLiteralExpression => ({
        type: 'expression:literal:number',
        content
      }),
      string: (content: string): StringLiteralExpression => ({
        type: 'expression:literal:string',
        content,
      })
    },
    binary: (left:Expression, right: Expression, operator: Operator): BinaryExpression => ({
      type: 'expression:binary',
      node_id: id('expression:binary'),
      left,
      right,
      operator,
    }),
    identifier: (text: string): IdentifierExpression => ({
      type: 'expression:identifier',
      node_id: id('expression:identifier'),
      text,
    }),
    function: (args: string[], body: Statement[]): FunctionExpression => ({
      type: 'expression:function',
      node_id: id('expression:function'),
      args,
      body,
    }),
    call: (func: Expression, args: Expression[]): CallExpression => ({
      type: 'expression:call',
      node_id: id('expression:call'),
      args,
      func,
    })
  }


  export type FunctionExpression = Node<'expression:function', {
    args: string[],
    body: Statement[],
  }>;

  export type CallExpression = Node<'expression:call', {
    func: AST.Expression,
    args: AST.Expression[],
  }>;

  export type IdentifierExpression = Node<'expression:identifier', {
    text: string,
  }>;

  export type LiteralExpression =
    | StringLiteralExpression
    | NumberLiteralExpression

  export type StringLiteralExpression = Node<"expression:literal:string", {
    content: string
  }>
  export type NumberLiteralExpression = Node<"expression:literal:number", {
    content: number
  }>

  export type BinaryExpression = Node<"expression:binary", {
    left: Expression,
    right: Expression,
    operator: Operator
  }>;

  export type Operator =
    | Node<'operator:multiplication'>
    | Node<'operator:addition'>
    | Node<'operator:subtraction'>
    | Node<'operator:division'>

  export const operator = {
    multiplication: (): Node<'operator:multiplication'> => ({
      type: 'operator:multiplication',
      node_id: id('operator:multiplication')
    }),
    addition: (): Node<'operator:addition'> => ({
      type: 'operator:addition',
      node_id: id('operator:addition')
    }),
    subtraction: (): Node<'operator:subtraction'> => ({
      type: 'operator:subtraction',
      node_id: id('operator:subtraction')
    }),
    division: (): Node<'operator:division'> => ({
      type: 'operator:division',
      node_id: id('operator:division')
    }),
  }

  export type Any =
    | Program
    | Statement
    | Expression
}
