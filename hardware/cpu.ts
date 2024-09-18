import { Core } from "isa";
import { create8Cache } from "./cache";
import { Clock } from "./clock";
import { Memory } from "./memory";
import { createRegister } from "./register";

export const createCPU = (clock: Clock, memory: Memory) => {
  const instruction_cache = create8Cache(clock, memory);

  const registers = {
    instruction_address: createRegister(),
    instruction_cache_offset: createRegister(),

    state: createRegister(),


    general_purpose: {
      0: createRegister(),
      1: createRegister(),
      2: createRegister(),
      3: createRegister(),
      4: createRegister(),
      5: createRegister(),
      6: createRegister(),
      7: createRegister(),
    }
  };

  const run_instruction = (instruction: Core.Any) => {
    switch (instruction.type) {
      case 'core.system.halt': {
        registers.state.write(0);
        break;
      }
      case 'core.math.add': {
        const left = registers.general_purpose[instruction.left].read();
        const right = registers.general_purpose[instruction.right].read();
        const value = left + right;
        registers.general_purpose[instruction.dest].write(value)
        break;
      }
      case 'core.math.multiply': {
        const left = registers.general_purpose[instruction.left].read();
        const right = registers.general_purpose[instruction.right].read();
        const value = left * right;
        registers.general_purpose[instruction.dest].write(value)
        break;
      }
      case 'core.register.put': {
        registers.general_purpose[instruction.dest].write(instruction.value);
        break;
      }
    }
  }

  const tick = () => {
    switch (registers.state.read()) {
      // CPU is stopped
      case 0:
        break;
      // Preparing to load next instruction
      case 1: {
        const instruction_address = registers.instruction_address.read();
        // Wait until instruction cache is ready to recieve new order
        if (instruction_cache.registers.state.read() !== 0)
          return;
        instruction_cache.registers.address.write(instruction_address);
        instruction_cache.registers.state.write(1);
        instruction_cache.registers.index.write(0);
        registers.state.write(2);
        break;
      }
      case 2: {
        if (instruction_cache.registers.state.read() === 0) {
          registers.state.write(3);
        }
        break;
      }
      // Loading next instruction
      case 3: {
        const offset = registers.instruction_cache_offset.read();
        const instruction_buffer = [
          instruction_cache.registers[0].read(),
          instruction_cache.registers[1].read(),
          instruction_cache.registers[2].read(),
          instruction_cache.registers[3].read(),
          instruction_cache.registers[4].read(),
          instruction_cache.registers[5].read(),
          instruction_cache.registers[6].read(),
          instruction_cache.registers[7].read()
        ];
        const instruction = Core.serializer.read(instruction_buffer, offset);
        
        run_instruction(instruction);

        if (registers.state.read() === 0)
          break;

        if (offset === 4) {
          // We've reached the end of our instruction cache - lets load the next
          // set of instructions
          registers.instruction_cache_offset.write(0);

          const instruction_address = registers.instruction_address.read();
          registers.instruction_address.write(instruction_address + 8);
          registers.state.write(1);
        } else {
          // Increment the instruction cache's offset
          registers.instruction_cache_offset.write(4);
        }

        break;
      }
    }
  }

  clock.listen(tick);

  return { registers };
};
