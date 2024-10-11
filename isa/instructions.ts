import { RegisterID, toRegisterId } from "./register";
import { Word } from "./word";

export const reverseMap = <X extends string | number, Y extends string | number>(map: Record<X, Y>): Record<Y, X> => {
  return Object.fromEntries(
    Object.entries(map)
      .map(([name, value]) => [value, name])
  );
}

/**
 * An instruction is composed of exactly four words: one "type"
 * identifier (the instruction index) and three "arguments".
 */
export type InstructionWords = [Word, Word, Word, Word];

/**
 * The "argument" part of an instruction can either be a full word,
 * refer to a register, or not be used.
 */
type InstructionArgDef =
  | { type: 'word' }
  | { type: 'register_id' }
  | { type: 'unused' }

/**
 * The data type that describes an "Instruction"
 */
export type InstructionDef = {
  type: string,
  args: [
    InstructionFieldDef,
    InstructionFieldDef,
    InstructionFieldDef,
  ]
};

type InstructionFieldDef = [string, InstructionArgDef];

export type InstructionArgs<T extends InstructionDef> =
  & InstructionArgField<T["args"][0]>
  & InstructionArgField<T["args"][1]>
  & InstructionArgField<T["args"][2]>

/**
 * A type that converts and InstructionDef type into
 * the type of an instance of that instruction.
 */
type InstructionFromDef<T extends InstructionDef> = {
  type: T["type"],
} & InstructionArgs<T>

/**
 * Convert a "InstructionArgDef" into the actual type it represents
 * (unused) becomes "never"
 */
type TypeFromInstructionPartDef<T extends InstructionArgDef> =
  | T["type"] extends "word" ? Word : never
  | T["type"] extends "register_id" ? RegisterID : never

/**
 * When converting an instruction's arg, if the instruction is "unused",
 * don't include it or it's name in the object
 */
type InstructionArgField<T extends InstructionFieldDef> =
  T[1] extends { type: 'unused' }
    ? {}
    : { [value in T[0]]: TypeFromInstructionPartDef<T[1]> }


export const defineInstruction = <T extends InstructionDef>(value: T): T => value;

export type InstructionSerializer<T extends InstructionDef> = {
  serialize(value: InstructionFromDef<T>): [number, number, number],
  deserialize(args: [number, number, number]): InstructionFromDef<T>
}

/**
 * Create functions that can (de)serialize an instruction
 */
const createInstructionSerializer = <T extends InstructionDef>(def: T): InstructionSerializer<T> => {
  type InstructionType = InstructionFromDef<T>;

  const deserializeValue = <T extends InstructionArgDef>(def: T, value: Word): TypeFromInstructionPartDef<T> => {
    switch (def.type) {
      case 'word':
        return value as TypeFromInstructionPartDef<T>;
      case 'unused':
        throw new Error('This property is not used, and cannot be deserialized')
      case 'register_id':
        return toRegisterId(value) as TypeFromInstructionPartDef<T>;
    }
  }

  return {
    serialize(value: InstructionType) {
      const [first, second, third] = def.args
        .map(([arg_name, arg_type]) => (value[arg_name as keyof InstructionType] || 0) as Word);

      return [first, second, third];
    },
    deserialize(args: [number, number, number]) {
      const [arg_def_1, arg_def_2, arg_def_3] = def.args;
      const value = {
        type: def.type as T["type"],

        ...(arg_def_1[1].type === 'unused' ? {} : { [arg_def_1[0]]: deserializeValue(arg_def_1[1], args[0]) }),
        ...(arg_def_2[1].type === 'unused' ? {} : { [arg_def_2[0]]: deserializeValue(arg_def_2[1], args[1]) }),
        ...(arg_def_3[1].type === 'unused' ? {} : { [arg_def_3[0]]: deserializeValue(arg_def_3[1], args[2]) }),
      } as InstructionType;

      return value;
    }
  }
}

export namespace Instructions {
  export const word_size = 4;
  
  export const defs = {
    add: defineInstruction({
      type: 'math.add',
      args: [
        ['left', { type: 'register_id' }],
        ['right', { type: 'register_id' }],
        ['output', { type: 'register_id' }],
      ]
    } as const),
    multiply: defineInstruction({
      type: 'math.multiply',
      args: [
        ['left', { type: 'register_id' }],
        ['right', { type: 'register_id' }],
        ['output', { type: 'register_id' }],
      ]
    } as const),

    read: defineInstruction({
      type: 'memory.read',
      args: [
        ['address', { type: 'register_id' }],
        ['output', { type: 'register_id' }],
        ['_', { type: 'unused' }],
      ]
    } as const),
    write: defineInstruction({
      type: 'memory.write',
      args: [
        ['value', { type: 'register_id' }],
        ['address', { type: 'register_id' }],
        ['_', { type: 'unused' }],
      ]
    } as const),

    put: defineInstruction({
      type: 'register.put',
      args: [
        ['value', { type: 'word' }],
        ['output', { type: 'register_id' }],
        ['_', { type: 'unused' }]
      ]
    } as const),
    copy: defineInstruction({
      type: 'register.copy',
      args: [
        ['input', { type: 'register_id' }],
        ['output', { type: 'register_id' }],
        ['_', { type: 'unused' }]
      ]
    } as const),

    call: defineInstruction({
      type: 'system.call',
      args: [
        ['type', { type: 'word' }],
        ['_', { type: 'unused' }],
        ['_', { type: 'unused' }]
      ]
    } as const),
    halt: defineInstruction({
      type: 'system.halt',
      args: [
        ['_', { type: 'unused' }],
        ['_', { type: 'unused' }],
        ['_', { type: 'unused' }]
      ]
    } as const),

    jump: defineInstruction({
      type: 'control.jump',
      args: [
        ['is_conditional', { type: 'word' }],
        ['condition', { type: 'register_id' }],
        ['address', { type: 'register_id' }],
      ]
    } as const)
  };

  /**
   * All the different instructions, and their "index"
   */
  export const type_indices = {
    [defs.add.type]: 0,
    [defs.multiply.type]: 1,
    [defs.read.type]: 2,
    [defs.write.type]: 3,
    [defs.put.type]: 4,
    [defs.copy.type]: 5,
    [defs.call.type]: 6,
    [defs.halt.type]: 7,
    [defs.jump.type]: 8,
  } as const;

  const type_by_indices = reverseMap(type_indices);
  const instruction_indices = new Set<number>(Object.values(type_indices));

  export type Add = InstructionFromDef<typeof defs.add>;
  export type Multiply = InstructionFromDef<typeof defs.multiply>;

  export type Read = InstructionFromDef<typeof defs.read>;
  export type Write = InstructionFromDef<typeof defs.write>;

  export type Put = InstructionFromDef<typeof defs.put>;
  export type Copy = InstructionFromDef<typeof defs.copy>;

  export type Call = InstructionFromDef<typeof defs.call>;
  export type Halt = InstructionFromDef<typeof defs.halt>;

  export type Jump = InstructionFromDef<typeof defs.jump>;

  export type Any =
    | Add
    | Multiply
    | Read
    | Write
    | Put
    | Copy
    | Call
    | Halt
    | Jump

  export type Type = Any["type"];
    
  export const serializers = {
    [defs.add.type]: createInstructionSerializer(defs.add),
    [defs.multiply.type]: createInstructionSerializer(defs.multiply),

    [defs.read.type]: createInstructionSerializer(defs.read),
    [defs.write.type]: createInstructionSerializer(defs.write),

    [defs.put.type]: createInstructionSerializer(defs.put),
    [defs.copy.type]: createInstructionSerializer(defs.copy),

    [defs.call.type]: createInstructionSerializer(defs.call),
    [defs.halt.type]: createInstructionSerializer(defs.halt),

    [defs.jump.type]: createInstructionSerializer(defs.jump)
  } as const;
  
  export const add = (left: RegisterID, right: RegisterID, output: RegisterID): Add => ({
    type: defs.add.type,
    left,
    right,
    output,
  }) ;
  export const multiply = (left: RegisterID, right: RegisterID, output: RegisterID): Multiply => ({
    type: defs.multiply.type,
    left,
    right,
    output,
  });
  export const read = (address: RegisterID, output: RegisterID): Read => ({
    type: defs.read.type,
    address,
    output,
  });
  export const write = (value: RegisterID, address: RegisterID): Write => ({
    type: defs.write.type,
    value,
    address,
  });
  export const put = (value: Word, output: RegisterID): Put => ({
    type: defs.put.type,
    value,
    output,
  });
  export const copy = (input: RegisterID, output: RegisterID): Copy => ({
    type: defs.copy.type,
    input,
    output,
  });

  export const defs_by_type: { [i in Type]: Extract<typeof defs[keyof typeof defs], { type: i }> } =
    Object.fromEntries(Object.values(defs).map(def => [def.type, def])) as any;

  export const create = <T extends Type>(
    type: T,
    args: InstructionArgs<(typeof defs_by_type)[T]>
  ): InstructionFromDef<Extract<typeof defs[keyof typeof defs], { type: T }>> => {
    return { type, ...args } as any;
  }

  export const serialize = (op: Any): InstructionWords => {
    const serializer = serializers[op.type] as InstructionSerializer<InstructionDef>
    const [arg_0, arg_1, arg_2] = serializer.serialize(op as any);
    const type_index = type_indices[op.type];

    return [type_index, arg_0, arg_1, arg_2]
  }
  export const deserialize = (words: Word[]): Any => {
    const type_index = words[0];
    if (!instruction_indices.has(type_index))
      throw new Error(`Instruction type index is unknown`);

    const type = type_by_indices[type_index as keyof typeof type_by_indices];

    const serializer = serializers[type] as ReturnType<typeof createInstructionSerializer>;
    return serializer.deserialize([words[1], words[2], words[3]]) as any;
  }
}

export type Instructions = Instructions.Any;