import { Core, Word, instruction_word_size } from "isa";
import { Executable } from "operating_system";
import { getStructBytes, getStructSize } from "../codegen/mod";
import { prelude_struct_def } from "./prelude";
import { CodegenInstruction } from "../codegen/instructions";
import { mapInstructions, mapIslands, resolve_labels, resolve_variables } from "./resolve";
import { AssemblyDebug } from "./debug";

export const assemble = (
  generated_instructions: CodegenInstruction[]
): [Executable, AssemblyDebug] => {
  const memory: Word[] = [];

  const mapper_state = mapIslands(generated_instructions);

  const stackSize = 128;
  const programSize = mapper_state.mapped_instructions.length * instruction_word_size;
  const preludeSize = getStructSize(prelude_struct_def);
  
  const prelude_start = 0;
  const program_start = prelude_start + preludeSize;
  const heap_start = program_start + programSize;
  const stack_start = heap_start + stackSize;

  const prelude = getStructBytes(prelude_struct_def, {
    program_start,
    stack_start,
    heap_start,
  });

  const vars = new Map([
    ...mapper_state.labels,
    ['program_start', program_start],
    ['stack_start', stack_start],
    ['heap_start', heap_start],
    ['alloc_state_addr', heap_start]
  ]);

  const resolved_instructions = resolve_variables(mapper_state.mapped_instructions, vars) as Core.Instruction[];
  const program_code = resolved_instructions.flatMap(i => Core.serializer.write(i));

  memory.push(...[
    prelude,
    program_code,
  ].flat(1))
  const start = getStructSize(prelude_struct_def);

  const executable: Executable = {
    start,
    state: {
      general_purpose_registers: {
        0: 0,
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      }
    },
    memory,
  }

  const debug: AssemblyDebug = {
    codegen_instructions: generated_instructions,
    flat_instructions: mapper_state.mapped_instructions,
    final_instructions: resolved_instructions,
    instruction_groups: mapper_state.groups,
    vars,

    prelude_start,
    program_start,
    stack_start,
    heap_start,
  }


  return [executable, debug];
}