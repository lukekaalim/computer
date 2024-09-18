import { Core, RegisterID } from "isa"

export type Segment = {
  label_id: string,
  steps: Step[],
}

export type Step =
  | { type: 'link.instruction', instruction: Core.Any }
  | { type: 'link.load_variable', variable_id: string, destination: RegisterID }