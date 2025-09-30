import { Instructions, Word } from "isa";
import { Span } from "../codegen/span";
import { Generator } from "compiler/codegen";
import { DataTable } from "./data";

export type AssemblyDebug = {
  generator: Generator.State,

  instructions: Instructions.Any[],
  program_words: Word[],
  variable_map: Map<string, Word>,

  spans: Span[],
  data_table: DataTable,

  program_start: number,
  data_start: number,
  heap_start: number,
  stack_start: number,
};
