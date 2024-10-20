import { Word } from "isa";

/**
 * A struct is a way of organizing data
 */
export type Struct = {
  name: string,
  fields: string[]
}

export namespace Struct {
  export type Definition = {
    name: string,
    fields: string[]
  };
  export const define = (name: string, fields: string[]): Struct => ({
    name,
    fields,
  });

  /** How many words is a struct made up of */
  export const sizeOf = (def: Definition) => {
    return def.fields.length;
  }

  /** How many words away from a struct's address is a particular field stored */
  export const fieldOffset = (def: Definition, field: string) => {
    const fieldIndex = def.fields.indexOf(field);
    if (fieldIndex === -1)
      throw new Error(`Field "${field}" not found in struct ${def.name}`);
    return fieldIndex;
  }

  export const getBytes = (def: Definition, fields: Record<string, Word>): Word[] => {
    return def.fields.map(field => fields[field] || 0);
  }
}