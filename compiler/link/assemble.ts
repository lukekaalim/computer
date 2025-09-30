import { Instructions, Word } from "isa";
import { Executable } from "operating_system";
import { AssemblyDebug } from "./debug";

import { Generator, Variable } from "compiler/codegen";

import { resolveDataBlock, resolveDatas, resolveInstruction, resolveInstructions } from "./resolve";
import { Struct } from "../struct/mod";
import { createDataTable } from "./data";

export const assemble = (
  generator: Generator.State,
): [Executable, AssemblyDebug] => {
  const memory: Word[] = [];

  const instruction_nodes = [];

  instruction_nodes.push(...generator.output);

  const stack_size = 128;
  const program_size = instruction_nodes.length * Instructions.word_size;

  const data_table = createDataTable(generator.data_blocks);

  const free_memory_start = program_size + data_table.totalSize;

  const variable_map = new Map<string, Word>([
    ...generator.groups.map(group => [
      [`${group.id}`, group.start],
      [`${group.id}:start`, group.start],
      [`${group.id}:end`, group.end],
    ] as const).flat(1),

    ...[...generator.variables.values()].map((variable: Variable) =>
        [variable.id, variable.value] as const
    ),
    ...[...data_table.offsetsById.entries()].map(([id, offset]) =>
        [id, offset + program_size] as const
    ),
    ['free_memory_start', free_memory_start],
    ['stack_size', stack_size]
  ])
  const spans = [
    ...generator.groups,
    ...generator.il_node_spans,
  ];

  const instructions = resolveInstructions(instruction_nodes, variable_map);
  const data_words = resolveDatas(generator.data_blocks, variable_map);
  const program_words = instructions.flatMap(Instructions.serialize);

  memory.push(...program_words);
  memory.push(...data_words);

  const executable: Executable = {
    start: 0,
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
    generator,
    program_words,
    instructions,
    variable_map,
    spans,
    data_table,

    program_start: 0,
    data_start: program_size,
    stack_start: free_memory_start,
    heap_start: free_memory_start + stack_size,
  }


  return [executable, debug];
}