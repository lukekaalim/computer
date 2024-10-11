import { Struct } from "../struct/mod";
import { IL } from "./nodes";
import { id } from "../utils";

export const allocStackStruct = (def: Struct.Definition, id: string, withStruct: IL.Node) => {
  return IL.label(`use:${def.name}:${id}`,
    IL.stack(id, Struct.sizeOf(def), withStruct)
  );
};

/**
 * Places the memory address of a
 * field of a stack-allocated struct
 */
export const putStackFieldAddress = (
  stack_entry_id: string,
  def: Struct.Definition,
  field: string,

  dest_rid: IL.InstructionArg,
) => {
  const field_offset = Struct.fieldOffset(def, field);
  
  return IL.autoBorrowRegister(temp_rid =>
    IL.list([
      // put stack base
      IL.instruction('register.put', {
        value: { type: 'reference', id: 'stack_start' },
        output: temp_rid,
      }),
      // put stack offset
      IL.instruction('register.put', {
        value: { type: 'reference', id: stack_entry_id },
        output: dest_rid,
      }),
      IL.instruction('math.add', {
        left: temp_rid,
        right: dest_rid,
        output: dest_rid,
      }),
      ...(field_offset === 0 ? [] : [
        // put field offset
        IL.instruction('register.put', {
          value: IL.arg.literal(field_offset),
          output: temp_rid,
        }),
        IL.instruction('math.add', {
          left: temp_rid,
          right: dest_rid,
          output: dest_rid,
        }),
      ])
    ])
  );
}
