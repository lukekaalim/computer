import { VariableID } from "../codegen/variables";
import { id } from "../utils";
import { IL } from "./nodes";

/**
 * Write a variable to a static address
 * @param address_id
 * @param value 
 * @returns 
 */
export const writeValue = (address_id: VariableID, value_rid: IL.InstructionArg) => {
  return IL.label(id('writeValue'), IL.autoBorrowRegister(address_rid => IL.list([
    IL.instruction('register.put', {
      value: IL.arg.reference(address_id),
      output: address_rid,
    }),
    IL.instruction('memory.write', {
      address: address_rid,
      value: value_rid,
    })
  ])))
}