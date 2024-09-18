import { Clock } from "./clock";
import { Memory } from "./memory";
import { createRegister } from "./register";

export const create8Cache = (clock: Clock, memory: Memory) => {
  const registers = {
    address: createRegister(),

    state: createRegister(),
    index: createRegister(),

    0: createRegister(),
    1: createRegister(),
    2: createRegister(),
    3: createRegister(),
    4: createRegister(),
    5: createRegister(),
    6: createRegister(),
    7: createRegister(),
  };

  const tick = () => {
    switch (registers.state.read()) {
      case 1: {
        const index = registers.index.read();
        const address = registers.address.read();
  
        const indexAddress = index + address;

        // Wait until memory unit is ready
        if (memory.registers.mode.read() !== 0)
          return;
  
        memory.registers.address.write(indexAddress);
        memory.registers.mode.write(1);
        registers.state.write(2);
        break;
      }
      case 2: {
        if (memory.registers.mode.read() === 3) {
          const index = registers.index.read();
          const value = memory.registers.value.read();
          switch (index) {
            case 0: registers[0].write(value); break;
            case 1: registers[1].write(value); break;
            case 2: registers[2].write(value); break;
            case 3: registers[3].write(value); break;
            case 4: registers[4].write(value); break;
            case 5: registers[5].write(value); break;
            case 6: registers[6].write(value); break;
            case 7: registers[7].write(value); break;
          }
          // We have now written the value from memory
          // into the cache.
          if (index === 7) {
            // We've written to all the registers
            // We can finish
            registers.state.write(0);
            registers.index.write(0);
          } else {
            // Prepare to write the next register
            registers.state.write(1);
            registers.index.write(index + 1);
          }

          // set memory to idle
          memory.registers.mode.write(0);
        }
      }
    }
  };

  clock.listen(tick);

  return { registers }
};