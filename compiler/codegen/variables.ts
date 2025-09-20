import { Word } from "isa"

export type VariableID = string;

export type Variable = {
  id: VariableID,
  value: Word
}