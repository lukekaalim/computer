import { Instructions, Word } from "isa";
import { Executable } from "operating_system";
import { prelude_struct_def } from "./prelude";
import { AssemblyDebug } from "./debug";

import { Generator, Variable } from "compiler/codegen";

import { resolveInstruction, resolveInstructions } from "./resolve";
import { Struct } from "../struct/mod";

export const assemble = (
  generator: Generator.State,
): [Executable, AssemblyDebug] => {
  const memory: Word[] = [];

  const instruction_nodes = [...generator.output];

  instruction_nodes.push({
    type: 'instruction',
    instruction_type: 'system.halt',
    args: {}
  });

  const stack_size = 128;
  const program_size = instruction_nodes.length * Instructions.word_size;
  const prelude_size = Struct.sizeOf(prelude_struct_def);
  
  const prelude_start = 0;
  const program_start = prelude_start + prelude_size;
  const stack_start = program_start + program_size;
  const heap_start = stack_start + stack_size;

  const prelude = Struct.getBytes(prelude_struct_def, {
    program_start,
    stack_start,
    heap_start,
  });

  const variable_map = new Map<string, Word>([
    ...generator.groups.map(group => [
      [`${group.id}`, group.start],
      [`${group.id}:start`, group.start],
      [`${group.id}:end`, group.end],
    ] as const).flat(1),

    ...[...generator.variables.values()].map((variable: Variable) =>
        [variable.id, variable.value] as const
    ),
    ...[...generator.stack_entries.values()].map((stack) =>
        [stack.id, stack.offset] as const
    ),

    ['program_start', program_start],
    ['stack_start', stack_start],
    ['heap_start', heap_start],
    ['alloc_state_addr', heap_start]
  ])
  const spans = [
    ...generator.groups,
    ...generator.il_node_spans,
  ];

  const instructions = resolveInstructions(instruction_nodes, variable_map);
  const program_words = instructions.flatMap(Instructions.serialize);

  memory.push(...[
    prelude,
    program_words,
  ].flat(1))

  const executable: Executable = {
    start: program_start,
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
    program_words,
    instructions,
    variable_map,
    spans,

    prelude_start,
    program_start,
    stack_start,
    heap_start,
  }


  return [executable, debug];
}