# Compiler

The compiler works in 5 stages, taking in some text and
producing an executable file that the hardware can load
and run:

  1. Lexer. Converts "raw text" into an "array of tokens"
  2. Parser. Converts an "array of tokens" into an "Abstract Syntax Tree"(AST).
  3. IL Generation. Converts an AST into the "Intermediate Language"(IL).
  4. Code Generation. Convert the Intermediate Language into Islands and Instructions
  5. Converts Linkable Instructions into an Executable