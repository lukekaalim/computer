# Compiler/AST

```ts
import { AST, Tokens } from 'compiler/ast';
```

The "AST" module from the compiler is responsible
for transforming raw text into an Abstract Syntax
Tree.

It does so in two steps:

  1. **Lexer.** This reads the text one character at a time, sorting different groups
  of characters into "tokens", a distinct element of the programming languages grammar.
      - Tokens include things like:
          - keywords or identifiers: `const`, `var`, `function`, `class`, `export`, `myModule`
          - numeric literals: `1.0`, `100`, `0.0005`
          - string literals: `"some arbitrary text"`, `"text including keyword"`
          - comments: `// comment text`
          - syntax elements: `;`, `+`, `=`, `*`
          - whitespace: `\n`, ` `, `\t`
  2. **Parser.** This reads an array of tokens and emits an Abstract Syntax Tree (AST), a tree of nodes that represent different syntax concepts of the programming language. This tree should be a complete data structure representing the meaning of all the text in the program.
      - Abstract Syntax Tree nodes include things like:
        - Functions: `function main() {  }`
        - Statements: `const greeting = 'hello' + 'world'`;
        - Expressions: `'hello' + 'world'`;
        - Literal Values: `'hello'`, `'world'`
      - AST nodes are specific in what kinds of children they can have. The root "Program" node can only have Functions, and Function nodes can only have statements and such.
      - AST nodes are often specific: "binary expression", "string literal", "declaration statement". 