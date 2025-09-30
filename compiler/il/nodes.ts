import { Instructions, register_ids, RegisterID, Word } from "isa"
import { id } from "../utils";
import { Struct } from "../mod";

export namespace IL {
  export type InstructionBinaryExpression =
    | { type: 'add', left: InstructionArg, right: InstructionArg }
  export type InstructionArg =
    | { type: 'literal', value: number }
    | { type: 'reference', id: string }
    //| { type: 'expression', expr: InstructionBinaryExpression }

  export type Expression =
    | { type: 'literal', value: number }
    | { type: 'reference', id: string }

  type InstructionArgs<T extends Instructions.Any> = {
    [key in Exclude<keyof T, "type">]: InstructionArg
  }

  export const arg = {
    literal: (value: number): InstructionArg => ({ type: 'literal', value }),
    reference: (id: string): InstructionArg => ({ type: 'reference', id }),
  }
  export const expr = arg;
  
  export type InstructionNode = {
    type: 'instruction',
    instruction_type: Instructions.Any["type"],
    args: InstructionArgs<Instructions.Any>,
  }
  export const instruction = <T extends Instructions.Any["type"]>(
    instruction_type: T,
    args: InstructionArgs<Extract<Instructions.Any, { type: T }>>
  ): InstructionNode => ({
    type: 'instruction',
    instruction_type,
    args,
  })

  export type ListNode = {
    type: 'list',
    nodes: Node[],
  }
  export const list = (nodes: Node[]): ListNode => ({
    type: 'list',
    nodes,
  })

  /**
   * An Island Node is 
   */
  export type IslandNode = {
    type: 'island',
    contents: Node
  }
  export const island = (contents: Node): IslandNode => ({
    type: 'island',
    contents
  });

  /**
   * Declare a data node, which will be a set of bytes
   * allocated in the "Data" block of process memory.
   * 
   * The ID you passed to the data node can be used to
   * lookup the data at runtime.
   */
  export type DataNode = {
    type: 'data',
    id: string,
    contents: Expression[],
  }
  export const data = (id: string, contents: Expression[]): DataNode => ({
    type: 'data',
    id,
    contents
  })

  export type LabelNode = {
    type: 'label',
    id: string,
    withLabel: Node,
  }
  export const label = (id: string, withLabel: Node): LabelNode => ({
    type: 'label',
    id,
    withLabel,
  });

  export type BorrowRegisterNode = {
    type: 'borrow-register',
    id: string,
    withRegister: Node,
  }
  /**
   * Retrieve the next available free register. The RegisterID
   * is assigned to the variable named "id", and is only available
   * within node
   */
  export const borrowRegister = (id: string, withRegister: Node): BorrowRegisterNode => ({
    type: 'borrow-register',
    id,
    withRegister,
  })
  export const autoBorrowRegister = (withRegister: (register_id: InstructionArg) => Node): BorrowRegisterNode => {
    const register_id = id('borrow_register');
    return borrowRegister(register_id, withRegister(IL.arg.reference(register_id)));
  }
  export const autoBorrowRegisters = <T extends InstructionArg[]>(
    count: T["length"],
    withRegisters: (...register_ids: T) => Node
  ): Node  => {
    const register_ids = Array.from({ length: count })
      .map(() => id("borrow_register"));
    
    let node = withRegisters(...register_ids.map(id => IL.arg.reference(id)) as T);
    for (let i = 0; i < count; i++) {
      node = borrowRegister(register_ids[i], node);
    }
    return node;
  }

  /**
   * Jump to a new code routine.
   * If there are any borrowed registers, this node will throw an error
   * (all registers must be released before this node is invoked).
   */
  export type SubroutineNode = {
    type: 'subroutine',
  }

  export type Node =
    | InstructionNode
    | ListNode
    | IslandNode
    | LabelNode
    | BorrowRegisterNode
    | DataNode
}

export type IL = IL.Node;


IL.list([
  IL.instruction('register.put', { value: IL.arg.literal(5), output: IL.arg.literal(0) }), // put 5 in slot zero
  IL.instruction('register.put', { value: IL.arg.literal(5), output: IL.arg.literal(1) }), // put 5 in slot one

  // add slot zero and one together, and put the result in slot two
  IL.instruction('math.add', {
    left: IL.arg.literal(0),
    right: IL.arg.literal(1),
    output: IL.arg.literal(2)
  }),
]);
