import { Core, Word } from "isa";

export const serialize = (instructions: Core.Instruction[]): Word[] => {
  return instructions.flatMap(i => Core.serializer.write(i));
}