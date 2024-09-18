import { RegisterID, toRegisterId } from "./register";
import { Word } from "./word";

const instructions = [
  "core.math.add",
  "core.math.multiply",
  "core.register.put",
  "core.system.halt"
] as Core.Any["type"][];

export namespace Core {
  type CorePrefix = "core";

  export namespace Math {
    type MathPrefix = `${CorePrefix}.math`;

    export type Add = {
      type: `${MathPrefix}.add`,
      left: RegisterID,
      right: RegisterID,
      dest: RegisterID
    };
    export type Multiply = {
      type: `${MathPrefix}.multiply`,
      left: RegisterID,
      right: RegisterID,
      dest: RegisterID
    };
    export const factory = {
      add: (left: RegisterID, right: RegisterID, dest: RegisterID) => ({ type: 'core.math.add', left, right, dest }) as const,
      multiply: (left: RegisterID, right: RegisterID, dest: RegisterID) => ({ type: 'core.math.multiply', left, right, dest }) as const,
    }
  }
  export namespace Register {
    type RegisterPrefix = `${CorePrefix}.register`;

    export type Put = {
      type: `${RegisterPrefix}.put`,
      value: Word,
      dest: RegisterID
    };
    export const factory = {
      put: (value: Word, dest: RegisterID) => ({ type: 'core.register.put', value, dest }) as const,
    }
  }
  export namespace Control {
    type ControlPrefix = `${CorePrefix}.control`;

    export type ConditionalJump = {
      type: `${ControlPrefix}.conditional_jump`,
      test: RegisterID,
      address: RegisterID
    };
    export const factory = {
      conditional_jump: (test: RegisterID, address: RegisterID) => ({ type: 'core.control.conditional_jump', test, address }) as const,
    }
  }
  export namespace System {
    type SystemPrefix = `${CorePrefix}.system`;

    export type Halt = {
      type: `${SystemPrefix}.halt`
    };
    export const factory = {
      halt: () => ({ type: 'core.system.halt' })  as const,
    }
  }

  export type Any =
    | Math.Add
    | Math.Multiply
    | Register.Put
    | System.Halt

  export const factory = {
    ...Math.factory,
    ...System.factory,
    ...Control.factory,
    ...Register.factory,
  }

  export const serializer: Serializer<Any> = {
    read(bytes, address) {
      const type = instructions[bytes[address]];
      switch (type) {
        case 'core.math.add':
        case 'core.math.multiply':
          return {
            type,
            left: toRegisterId(bytes[address + 1]),
            right: toRegisterId(bytes[address + 2]),
            dest: toRegisterId(bytes[address + 3])
          }
        case 'core.register.put':
          return {
            type,
            value: bytes[address + 1],
            dest: toRegisterId(bytes[address + 2]),
          }
        case 'core.system.halt':
          return { type };
        default:
          throw new Error(`Unknown instruction: ${type}`);
      }
    },
    write(value) {
      const bytes = [0, 0, 0, 0];
      bytes[0] = instructions.indexOf(value.type);

      switch (value.type) {
        case 'core.math.add':
        case 'core.math.multiply':
          bytes[1] = value.left;
          bytes[2] = value.right;
          bytes[3] = value.dest;
          break;
        case 'core.register.put':
          bytes[1] = value.value;
          bytes[2] = value.dest;
          break;
        case 'core.system.halt':
          break;
      }
      return bytes;
    }
  }
}

export type Serializer<T> = {
  read(bytes: number[], address: number): T,
  write(value: T): number[],
}