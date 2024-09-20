import { Word } from "isa";
import { Executable } from "operating_system";
import { getStructBytes, getStructSize } from "../codegen/mod";
import { prelude_struct_def } from "./prelude";

export const compile = (program_code: Word[]): Executable => {
  const start = 0;
  const memory: Word[] = [];

  const stackSize = 128;
  const programSize = program_code.length;
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

  memory.push(...[
    prelude,
    program_code,
  ].flat(1))

  return {
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
}