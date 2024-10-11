# Compiler/IL

The "IL" module of the compiler is responsible for transforming
the Abstract Syntax Tree (AST) of the programming language
into a lower-level Intermediate Language (IL), which more concretely
deals with the specifics of the Instruction Set Architecture (ISA).

That is to say, IL includes a few abstractions "above" the raw assembly - allowing us to keep track of elements we want to put on a Stack, to reference variables and _locations_ of data that haven't actually been placed yet.

IL is generated in two step:
  - IL Nodes are generated from the AST representing different parts of the program.
      - For instance: when a function starts, we allocate all it's variables into a "Closure" Struct on the "Stack".
  - IL Nodes are "flatted" into an array of IL.InstructionNodes by the CodeGenerator, which walks the IL Node Tree, carrying some compiler state along with it.