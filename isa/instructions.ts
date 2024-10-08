import { RegisterID, toRegisterId } from "./register";
import { Word } from "./word";

export const instruction_word_size = 4 as const;

export const instructions = [
  "core.math.add",
  "core.math.multiply",
  "core.memory.read",
  "core.memory.write",
  "core.register.put",
  "core.register.copy",
  "core.control.conditional_jump",
  "core.system.halt",
  "core.system.call",
] as Core.Instruction["type"][];

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
      add: (left: RegisterID, right: RegisterID, dest: RegisterID) =>
        ({ type: 'core.math.add', left, right, dest }) as const,
      multiply: (left: RegisterID, right: RegisterID, dest: RegisterID) =>
        ({ type: 'core.math.multiply', left, right, dest }) as const,
    }
  }

  export namespace Memory {
    type MemoryPrefix = `${CorePrefix}.memory`;

    export type Read = {
      type: `${MemoryPrefix}.read`,
      addr: RegisterID,
      dest: RegisterID,
    }
    export type Write = {
      type: `${MemoryPrefix}.write`,
      addr: RegisterID,
      value: RegisterID,
    }
    export const factory = {
      read: (addr: RegisterID, dest: RegisterID) =>
        ({ type: 'core.memory.read', addr, dest }) as const,
      write: (addr: RegisterID, value: RegisterID) =>
        ({ type: 'core.memory.write', addr, value }) as const,
    }
  }

  export namespace Register {
    type RegisterPrefix = `${CorePrefix}.register`;

    export type Put = {
      type: `${RegisterPrefix}.put`,
      value: Word,
      dest: RegisterID
    };
    export type Copy = {
      type: `${RegisterPrefix}.copy`,
      target: RegisterID,
      dest: RegisterID
    };
    export const factory = {
      put: (value: Word, dest: RegisterID) =>
        ({ type: 'core.register.put', value, dest }) as const,
      copy: (target: RegisterID, dest: RegisterID) =>
        ({ type: 'core.register.copy', target, dest }) as const,
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
      conditional_jump: (test: RegisterID, address: RegisterID) =>
        ({ type: 'core.control.conditional_jump', test, address }) as const,
    }
  }
  export namespace System {
    type SystemPrefix = `${CorePrefix}.system`;

    export type Halt = {
      type: `${SystemPrefix}.halt`,
    };
    export type Call = {
      type: `${SystemPrefix}.call`
    }
    export const factory = {
      halt: () => ({ type: 'core.system.halt' })  as const,
      call: () => ({ type: 'core.system.call' })  as const,
    }
  }

  export type Instruction =
    | Math.Add
    | Math.Multiply
    | Memory.Read
    | Memory.Write
    | Control.ConditionalJump
    | Register.Put
    | Register.Copy
    | System.Halt
    | System.Call

  export const factory = {
    ...Math.factory,
    ...System.factory,
    ...Memory.factory,
    ...Control.factory,
    ...Register.factory,
  }

  export const serializer: Serializer<Instruction> = {
    read(bytes, address) {
      const type = instructions[bytes[address]];
      switch (type) {
        case 'core.math.add':
          return {
            type,
            left: toRegisterId(bytes[address + 1]),
            right: toRegisterId(bytes[address + 2]),
            dest: toRegisterId(bytes[address + 3])
          }
        case 'core.math.multiply':
          return {
            type,
            left: toRegisterId(bytes[address + 1]),
            right: toRegisterId(bytes[address + 2]),
            dest: toRegisterId(bytes[address + 3])
          }
        case 'core.memory.read':
          return {
            type,
            addr: toRegisterId(bytes[address + 1]),
            dest: toRegisterId(bytes[address + 2]),
          }
        case 'core.memory.write':
          return {
            type,
            addr: toRegisterId(bytes[address + 1]),
            value: toRegisterId(bytes[address + 2]),
          }
        case 'core.register.put':
          return {
            type,
            value: bytes[address + 1],
            dest: toRegisterId(bytes[address + 2]),
          }
        case 'core.register.copy':
          return {
            type,
            target: toRegisterId(bytes[address + 1]),
            dest: toRegisterId(bytes[address + 2]),
          }
        case 'core.control.conditional_jump':
          return {
            type,
            test: toRegisterId(bytes[address + 1]),
            address: toRegisterId(bytes[address + 2]),
          }
        case 'core.system.halt':
        case 'core.system.call':
          return { type } as Instruction;
        default:
          const _: never = type;
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
        case 'core.memory.read':
          bytes[1] = value.addr;
          bytes[2] = value.dest;
          break;
        case 'core.memory.write':
          bytes[1] = value.addr;
          bytes[2] = value.value;
          break;
        case 'core.register.put':
          bytes[1] = value.value;
          bytes[2] = value.dest;
          break;
        case 'core.register.copy':
          bytes[1] = value.target;
          bytes[2] = value.dest;
          break;
        case 'core.system.halt':
        case 'core.system.call':
          break;
        case 'core.control.conditional_jump':
          bytes[1] = value.test;
          bytes[2] = value.address;
          break;
        default:
          const _: never = value;
          throw new Error(`Cant write instruction ${(value as Instruction).type}`)
      }
      return bytes;
    }
  }
}

export type Serializer<T> = {
  read(bytes: number[], address: number): T,
  write(value: T): number[],
}