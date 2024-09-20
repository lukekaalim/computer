import { RegisterID } from "isa"

export type CodegenRegisterState =
  | { type: 'occupied', label: string }
  | { type: 'free' }

export type CodegenState = {
  register: {
    [r in RegisterID]: CodegenRegisterState
  }
}
