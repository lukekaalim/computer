import { RegisterID, Word } from "isa";

export type StructDefinition = {
  name: string,
  fields: string[]
};

export const defineStruct = (name: string, fields: string[]): StructDefinition => ({ name, fields });

export const getStructFieldOffset = (struct: StructDefinition, field: string): number => {
  return struct.fields.indexOf(field) || -1;
}

export const getStructBytes = (struct: StructDefinition, values: Record<string, number>): Word[] => {
  return struct.fields.map(field => values[field] || 0);
};

export const getStructSize = (struct_def: StructDefinition) => {
  return struct_def.fields.length;
}


export const generateReadStruct = (address: Word, struct_def: StructDefinition, prop: string, destination: RegisterID) => {
  
}