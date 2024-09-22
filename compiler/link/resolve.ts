import { Core, Word } from "isa";
import { CodegenInstruction, InstructionGroup, VariableMap } from "../codegen/instructions";

type InstructionMapperState = {
  current_instruction_index: number,
  groups: InstructionGroup[],
  pending_islands: CodegenInstruction[][],
  mapped_instructions: CodegenInstruction[],
  labels: Map<string, number>
};

export const createNewInstructionMapperState = (): InstructionMapperState => ({
  current_instruction_index: 0,
  pending_islands: [],
  groups: [],
  mapped_instructions: [],
  labels: new Map(),
});

export const mapInstructions = (
  instructions: CodegenInstruction[],
  state: InstructionMapperState = createNewInstructionMapperState(),
): InstructionMapperState => {
  for (const instruction of instructions) {
    if (instruction.label)
      state.labels.set(instruction.label, state.current_instruction_index);

    switch (instruction.type) {
      case 'linker.group': {
        const start_index = state.current_instruction_index
        mapInstructions(instruction.instructions, state);
        const end_index = state.current_instruction_index;
      
        state.groups.push({
          id: instruction.group_id,
          start_index,
          end_index
        })
        break;
      }
      case 'linker.island': {
        state.pending_islands.push(instruction.instructions);
        break;
      }
      default: {
        state.mapped_instructions.push(instruction);
        break;
      }
    }

    state.current_instruction_index++;
  }

  return state;
};

export const mapIslands = (
  initial_instructions: CodegenInstruction[],
  state: InstructionMapperState = createNewInstructionMapperState(),
): InstructionMapperState => {
  // inital top-level
  mapInstructions(initial_instructions, state);
  state.mapped_instructions.push({ type: 'core.system.halt' });

  let pending_island: null | CodegenInstruction[] = null
  while (pending_island = state.pending_islands.pop() || null) {
    mapInstructions(pending_island, state);
    state.mapped_instructions.push({ type: 'core.system.halt' });
  }

  return state;
}

export const resolve_labels = (instructions: CodegenInstruction[]): Map<string, Word> => {
  const labels = new Map<string, Word>();

  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    if (instruction.label)
      labels.set(instruction.label, i);
  }

  return labels;
}

export const resolve_variables = <T extends CodegenInstruction>(
  instructions: T[],
  variable_map: Map<string, Word>
): (Exclude<T, { type: 'linker.load_var' }> | Core.Register.Put)[] => {
  return instructions.map(instruction => {
    switch (instruction.type) {
      case 'linker.load_var':
        const value = variable_map.get(instruction.variable_id);
        if (typeof value !== 'number')
          throw new Error(`Unresolved Variabile Error: ${instruction.variable_id}`);
        return Core.factory.put(value, instruction.dest);
      default:
        return instruction as Exclude<T, { type: 'linker.load_var' }>;
    }
  })
}