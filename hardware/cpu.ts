import { Instructions } from "isa";
import { create8Cache } from "./cache";
import { Clock } from "./clock";
import { Memory } from "./memory";
import { createRegister } from "./register";

export const createCPU = (clock: Clock, memory: Memory) => {
  const instruction_cache = create8Cache(clock, memory);

  const registers = {
    instruction_address: createRegister(),
    instruction_cache_offset: createRegister(),

    /**
     * 0 = system idle
     * 1 = load instruction
     * 2 = wait for instruction cache
     * 3 = run instruction
     */
    state: createRegister(),
    instruction_state: createRegister(),


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

  const run_instruction = (instruction: Instructions.Any) => {
    switch (instruction.type) {
      case Instructions.defs.halt.type: {
        registers.state.write(0);
        break;
      }
      case Instructions.defs.add.type: {
        const left = registers.general_purpose[instruction.left].read();
        const right = registers.general_purpose[instruction.right].read();
        const value = left + right;
        registers.general_purpose[instruction.output].write(value)
        break;
      }
      case Instructions.defs.multiply.type: {
        const left = registers.general_purpose[instruction.left].read();
        const right = registers.general_purpose[instruction.right].read();
        const value = left * right;
        registers.general_purpose[instruction.output].write(value)
        break;
      }
      case Instructions.defs.put.type: {
        registers.general_purpose[instruction.output].write(instruction.value);
        break;
      }
      case Instructions.defs.copy.type: {
        const value = registers.general_purpose[instruction.input].read();
        registers.general_purpose[instruction.output].write(value);
        break;
      }
      case Instructions.defs.read.type: {
        switch (registers.instruction_state.read()) {
          case 0: {
            // Automatically set instruction state to a non-zero value
            // (this stops the CPU from advancing to the next instruction)
            registers.instruction_state.write(1);
          }
          case 1: {
            if (memory.registers.mode.read() !== 0)
              break;

            const address = registers.general_purpose[instruction.address].read();
            memory.registers.mode.write(1);
            memory.registers.address.write(address);
            registers.instruction_state.write(2);
            break;
          }
          case 2: {
            if (memory.registers.mode.read() !== 3)
              break;
            memory.registers.mode.write(0)
            registers.instruction_state.write(0);
            registers.general_purpose[instruction.output].write(memory.registers.value.read());
            break;
          }
          default:
            throw new Error(`Unexpected Instruction State ${registers.instruction_state.read()}`)
        }
        break;
      }
      case Instructions.defs.write.type: {
        switch (registers.instruction_state.read()) {
          case 0:
            registers.instruction_state.write(1);
          case 1:
            if (memory.registers.mode.read() !== 0)
              break;

            const address = registers.general_purpose[instruction.address].read();
            const value = registers.general_purpose[instruction.value].read();
            // Start the write
            memory.registers.mode.write(2);
            memory.registers.address.write(address);
            memory.registers.value.write(value);

            registers.instruction_state.write(2);
            break;
          case 2:
            // Write complete
            if (memory.registers.mode.read() !== 3)
              break;
            memory.registers.mode.write(0)
            registers.instruction_state.write(0);
            break;
        }
        break;
      }
      default: {
        throw new Error(`Unsupported Instruction ${instruction.type}`)
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
        const instruction = Instructions.deserialize(instruction_buffer.slice(offset, offset + 4));
        
        run_instruction(instruction);

        if (registers.state.read() === 0)
          break;
        if (registers.instruction_state.read() !== 0)
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

export type CPU = ReturnType<typeof createCPU>;