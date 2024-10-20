import { Instructions, register_ids, RegisterID, Word } from "isa"
import { id } from "../utils";
import { Struct } from "../mod";

export namespace IL {
  export type InstructionBinaryExpression =
    | { type: 'add', left: InstructionArg, right: InstructionArg }
  export type InstructionArg =
    | { type: 'literal', value: number }
    | { type: 'reference', id: string }
    | { type: 'expression', expr: InstructionBinaryExpression }

  type InstructionArgs<T extends Instructions.Any> = {
    [key in Exclude<keyof T, "type">]: InstructionArg
  }

  export const arg = {
    literal: (value: number): InstructionArg => ({ type: 'literal', value }),
    reference: (id: string): InstructionArg => ({ type: 'reference', id }),
  }
  
  export type InstructionNode = {
    type: 'instruction',
    instruction_type: Instructions.Any["type"],
    args: InstructionArgs<Instructions.Any>,
  }
  export const instruction = <T extends Instructions.Any["type"]>(
    instruction_type: T,
    args: InstructionArgs<Extract<Instructions.Any, { type: T}>>
  ): InstructionNode => ({
    type: 'instruction',
    instruction_type,
    args,
  })

  export type StackNode = {
    type: 'stack',
    label: string,
    def: Struct,
    withStackedValue: Node,
  }
  export const stack = (label: string, def: Struct, withStackedValue: Node): StackNode => ({
    type: 'stack',
    label,
    def,
    withStackedValue,
  })

  export type ListNode = {
    type: 'list',
    nodes: Node[],
  }
  export const list = (nodes: Node[]): ListNode => ({
    type: 'list',
    nodes,
  })

  export type IslandNode = {
    type: 'island',
    contents: Node
  }
  export const island = (contents: Node): IslandNode => ({
    type: 'island',
    contents
  });

  export type DataNode = {
    type: 'data',
    id: string,
    contents: Word[],
  }
  export const data = (id: string, contents: Word[]): DataNode => ({
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

  export type Node =
    | InstructionNode
    | StackNode
    | ListNode
    | IslandNode
    | LabelNode
    | BorrowRegisterNode
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
