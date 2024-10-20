import { Struct } from "compiler/struct"

export type StackEntry = {
  id: string,
  offset: number,
  def: Struct,
}