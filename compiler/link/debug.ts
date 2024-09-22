import { CodegenInstruction, InstructionGroup } from "../codegen/instructions";

export type AssemblyDebug = {
  instruction_groups: InstructionGroup[],
  final_instructions: CodegenInstruction[],
  flat_instructions: CodegenInstruction[],
  codegen_instructions: CodegenInstruction[]

  vars: Map<string, number>,

  program_start: number,
  prelude_start: number,
  heap_start: number,
  stack_start: number,
};