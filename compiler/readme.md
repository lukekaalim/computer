# Compiler

The compiler is composed of five submodules:
  - [Lexer](./lexer/readme.md)
  - [Parser](./parser/readme.md)
  - [IL](./il/readme.md)
  - [Codegen](./codegen/readme.md)
  - [Link](./link/readme.md)

It also exposes a utility function `compile()` that wraps
all three modules and calls their relevant functions.

## Design

This compiler targets OS/ISA. It's not very fast, or good.

The program lays out itself in the following way:
  1. Prelude
  2. Program Code
  3. Constant Memory
  4. Stack Memory
  5. Heap Memory

Program execution starts at the first instruction in program code.

Static data from the program is encoded into "Constant Memory". "Stack Memory"
is we keep data which we can (roughly) determine its position at compile time
(mostly just function variables before I implement closures).

