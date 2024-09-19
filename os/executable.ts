export type Executable = {
  start: number,
  memory: number[],

  state: {
    general_purpose_registers: {
      0: number,
      1: number,
      2: number,
      3: number,
      4: number,
      5: number,
      6: number,
      7: number,
    }
  }
}