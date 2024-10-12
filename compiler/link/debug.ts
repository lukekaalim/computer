import { Instructions, Word } from "isa";
import { Span } from "../codegen/span";

export type AssemblyDebug = {
  instructions: Instructions.Any[],
  program_words: Word[],
  variable_map: Map<string, Word>,

  spans: Span[],

  program_start: number,
  prelude_start: number,
  heap_start: number,
  stack_start: number,
};
