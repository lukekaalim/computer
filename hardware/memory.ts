import { Clock } from "./clock";
import { createRegister } from "./register";

export const createMemory = (clock: Clock, initialMemory: number[] = []) => {
  const contents: number[] = [...initialMemory];

  const registers = {
    /**
     * 0 = ready
     * 1 = reading
     * 2 = writing
     * 3 = complete
     */
    mode: createRegister(),
    address: createRegister(),
    value: createRegister()
  }

  const tick = () => {
    switch (registers.mode.read()) {
      case 0:
        break;
      case 1:
        registers.value.write(contents[registers.address.read()]);
        registers.mode.write(3);
      case 2:
        contents[registers.address.read()] = registers.value.read();
        registers.mode.write(3);
      case 3:
        break;
    }
  };

  clock.listen(tick);

  return { registers, contents };
};

export type Memory = ReturnType<typeof createMemory>;