import { Core, RegisterID, Word } from "isa"

export type Segment = {
  label_id: string,
  steps: Step[],

  next_segment_label: string | null,
}

export type Step =
  | { type: 'instruction', instruction: Core.Instruction }
  | { type: 'load_variable', variable_id: string, destination: RegisterID }

export type VariableMap = {
  vars: Map<string, Word>,
}

export const replaceVariable = (loadInstruction: Extract<Step, { type: 'load_variable' }>, map: VariableMap): Core.Instruction => {
  const value = map.vars.get(loadInstruction.variable_id);
  if (typeof value !== 'number')
    throw new Error();
  return { type: 'core.register.put', value, dest: loadInstruction.destination }
}