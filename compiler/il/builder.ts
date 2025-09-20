import { VariableID } from "../codegen/variables"

/**
 * As the IL builder traverses the AST of the code,
 * it needs to keep track of certain global
 * and local variables.
 */
export type ILBuilderState = {
  /**
   * The name of the compiler variable that
   * stores the (statically known) address
   * of the STACK_POINTER
   */
  stack_address_id: VariableID
}

export const startBuilder = () => {

};
