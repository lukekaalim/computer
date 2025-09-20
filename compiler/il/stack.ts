import { Struct } from "../struct/mod";
import { ProgramSetup } from "./climb";
import { IL } from "./nodes";

/**
 * Allocate a spot of the stack of $size amount.
 * (Valid until the stack frame is popped)
 * 
 * Writes the address of the newly allocated
 * block of stack memory to $register
 * 
 * @param program 
 * @param output_rid 
 * @param size 
 * @returns IL.Node
 */
export const allocateStackMemory = (
  program: ProgramSetup,
  output_rid: IL.InstructionArg,
  size: IL.Expression = IL.expr.literal(1),
): IL.Node => {
  return IL.list([
    IL.autoBorrowRegister(next_free_pointer_rid => IL.list([
      // Read the current value of the stack pointer from memory
      // (and write it into the output register, as this doubles as the
      // address of whatever we allocate)
      readFromStaticAddress(IL.arg.reference(program.stack_pointer_id), output_rid),
      // Get the size of the allocation, and put it into the temp register
      IL.instruction('register.put', {
        value: size,
        output: next_free_pointer_rid,
      }),
      // Add the size and the current stack pointer together, to
      // get the "next free pointer"
      IL.instruction('math.add', {
        left: output_rid,
        right: next_free_pointer_rid,
        output: next_free_pointer_rid,
      }),
      IL.instruction('memory.write', {
        value: next_free_pointer_rid,
        address: IL.arg.reference(program.stack_pointer_id),
      }),
      writeToStaticAddress(program.stack_pointer_id, next_free_pointer_rid),
    ]))
  ]);
}

const writeToStaticAddress = (addressId: string, value_rid: IL.InstructionArg) => {
  return IL.autoBorrowRegister(address_rid => IL.list([
    IL.instruction('register.put', {
      value: IL.arg.reference(addressId),
      output: address_rid,
    }),
    IL.instruction('memory.write', {
      value: value_rid,
      address: address_rid,
    })
  ]))
}

const readFromStaticAddress = (address: IL.InstructionArg, output_rid: IL.InstructionArg) => {
  return IL.list([
    IL.instruction('register.put', {
      value: address,
      output: output_rid,
    }),
    IL.instruction('memory.read', {
      address: output_rid,
      output: output_rid,
    }),
  ])
}

export const allocateStackFrame = (program: ProgramSetup) => {

};
