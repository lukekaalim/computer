import { allocateStackMemory, IL, ProgramSetup, Struct } from "../mod";
import { id } from "../utils";

/**
 * Allocate a Struct in the Stack Memory
 * (adding the struct size to the stack pointer,
 * and writing the previous stack pointer
 * value to an output register)
 * @param struct
 * @param program 
 * @param output_rid The ID of the register that the struct's address
 * will be written to
 */
export const allocateStackStruct = (
  struct: Struct.Definition,
  program: ProgramSetup,
  output_rid: IL.InstructionArg
): IL.Node => {
  return IL.label(id("allocate_stack_struct"),
    allocateStackMemory(program, output_rid, IL.arg.literal(struct.fields.length)))
}
