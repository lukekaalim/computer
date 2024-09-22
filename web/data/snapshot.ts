import { CPU, Memory } from "hardware"
import { RegisterID, Word } from "isa"

export type HardwareSnapshot = {
  memory: Word[],

  general_registers: { [key in RegisterID]: Word },
  instruction_address: Word,
}

export const captureSnapshot = (cpu: CPU, memory: Memory): HardwareSnapshot => {
  return {
    memory: [...memory.contents],
    instruction_address:
      + cpu.registers.instruction_cache_offset.read()
      + cpu.registers.instruction_address.read(),
    general_registers:
      mapObject(cpu.registers.general_purpose, (_, v) => v.read())
  }
}

const mapObject = <T extends Record<string, any>, X>(
  object: T,
  func: (key: keyof T, value: T[keyof T]) => X
): { [key in keyof T]: X } => {
  const result: Record<keyof T, X> = {} as any;
  for (const key in object) {
    result[key] = func(key, object[key]);
  }
  return result;
}