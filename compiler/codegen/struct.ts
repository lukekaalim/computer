import { Core, RegisterID, Word } from "isa";
import { CodegenInstruction, group } from "./instructions";

export type StructDefinition = {
  name: string,
  fields: string[]
};

export const defineStruct = (name: string, fields: string[]): StructDefinition => ({ name, fields });

export const calcFieldOffset = (struct: StructDefinition, field: string): number => {
  return struct.fields.indexOf(field) || -1;
}

export const getStructBytes = (struct: StructDefinition, values: Record<string, number>): Word[] => {
  return struct.fields.map(field => values[field] || 0);
};

export const getStructSize = (struct_def: StructDefinition) => {
  return struct_def.fields.length;
}

// Places the value in memory of this structs field into
// "destination_rid"
export const generateReadStructOps = (
  struct_address_rid: RegisterID,
  destination_rid: RegisterID,

  struct_def: StructDefinition,
  field: string,
  
): Core.Instruction[]  => {
  const field_offset = calcFieldOffset(struct_def, field);

  return [
    // Put the field address into destination_rid
    Core.factory.put(field_offset, destination_rid),
    Core.factory.add(struct_address_rid, destination_rid, destination_rid),
    // Then read it, and replace the value!
    Core.factory.read(destination_rid, destination_rid),
  ]
}

// Places a value into a struct's field
export const generateWriteStructOps = (
  struct_address_rid: RegisterID,
  value_rid: RegisterID,
  temp_0_rid: RegisterID,

  struct_def: StructDefinition,
  field: string,
): CodegenInstruction[]  => {
  const field_offset = calcFieldOffset(struct_def, field);

  return [
    group([
      // Put the field address into destination_rid
      Core.factory.put(field_offset, temp_0_rid),
      Core.factory.add(struct_address_rid, temp_0_rid, temp_0_rid),
      // Then read it, and replace the value!
      Core.factory.write(value_rid, temp_0_rid),
    ], `struct.write.${struct_def.name}.${field}`)
  ]
}
