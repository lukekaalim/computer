import { Clock } from "./clock";
import { createRegister } from "./register";

export const createMemory = (clock: Clock, initialMemory: number[] = []) => {
  const contents: number[] = [...initialMemory];

  const registers = {
    mode: createRegister(),
    address: createRegister(),
    value: createRegister()
  }

  const tick = () => {
    const mode = registers.mode.read();

    if (mode === 1) {
      registers.value.write(contents[registers.address.read()]);
      registers.mode.write(0);
    }
    else if (mode === 2) {
      contents[registers.address.read()] = registers.value.read();
      registers.mode.write(0);
    }
  };

  clock.listen(tick);

  return { registers, contents };
};

export type Memory = ReturnType<typeof createMemory>;