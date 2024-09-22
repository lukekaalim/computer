import { CPU, Memory } from "hardware";
import { Executable } from "./executable";

export const loadExecutable = (cpu: CPU, memory: Memory, executable: Executable) => {
  // layout memory
  memory.contents.length = 0;
  memory.contents.push(...executable.memory);

  // setup instruction_pointers
  cpu.registers.state.write(1);
  cpu.registers.instruction_state.write(0);
  cpu.registers.instruction_address.write(executable.start);
  cpu.registers.instruction_cache_offset.write(0);

  // setup general purpose registes
  cpu.registers.general_purpose[0].write(executable.state.general_purpose_registers[0]);
  cpu.registers.general_purpose[1].write(executable.state.general_purpose_registers[1]);
  cpu.registers.general_purpose[2].write(executable.state.general_purpose_registers[2]);
  cpu.registers.general_purpose[3].write(executable.state.general_purpose_registers[3]);
  cpu.registers.general_purpose[4].write(executable.state.general_purpose_registers[4]);
  cpu.registers.general_purpose[5].write(executable.state.general_purpose_registers[5]);
  cpu.registers.general_purpose[6].write(executable.state.general_purpose_registers[6]);
  cpu.registers.general_purpose[7].write(executable.state.general_purpose_registers[7]);
}
