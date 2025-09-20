import { Clock } from "./clock";
import { createRegister } from "./register";

/**
 * Create a piece of hardware that can perform
 * basic arithmetic
 */
export const createALU = (clock: Clock) => {
  const registers = {
    /** 
     * 0 = idle
     * 1 = input ready
     * 2 = output ready
    */
    mode: createRegister(),

    /**
     * 0 = Add
     * 1 = Multiply
     * 2 = Less Than
     * 3 = And
     * 4 = Or
     */
    operation: createRegister(),

    left: createRegister(),
    right: createRegister(),
    output: createRegister(),
  }

  const tick = () => {
    switch (registers.mode.read()) {
      case 0:
        return;
      case 1: {
        const left = registers.left.read();
        const right = registers.right.read();
        switch (registers.operation.read()) {
          case 0:
            registers.output.write(left + right);
            break;
          case 1:
            registers.output.write(left * right);
            break;
          case 3:
            registers.output.write(left < right ? 1 : 0)
            break;
          case 4:
            registers.output.write(left && right ? 1 : 0)
            break;
          case 5:
            registers.output.write(left || right ? 1 : 0)
            break;
        }
        registers.mode.write(2);
      }
      case 2:
        return;
    }
  };
  clock.listen(tick);

  return { registers };
};
