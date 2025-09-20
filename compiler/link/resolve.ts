import { Instructions, Word } from "isa";
import { IL } from "../il/nodes";

export const resolveDatas = (
  dataBlock: IL.DataNode[],
  variables: Map<string, Word>
): Word[] => {
  return dataBlock.map(block => resolveDataBlock(block, variables)).flat(1);
}

export const resolveDataBlock = (
  dataBlock: IL.DataNode,
  variables: Map<string, Word>
): Word[] => {
  return dataBlock.contents.map(expression =>
    resolveExpression(expression, variables));
}

export const resolveInstructions = (
  instructions: IL.InstructionNode[],
  variables: Map<string, Word>
): Instructions[] => {
  return instructions.map(instruction => {
    return resolveInstruction(instruction, variables);
  });
}

export const resolveInstruction = (
  instruction: IL.InstructionNode,
  variables: Map<string, Word>
): Instructions.Any => {
  const def = Instructions.defs_by_type[instruction.instruction_type];

  const args = Object.fromEntries(def.args.map(([arg, field_type]) => {
    if (field_type.type === 'unused')
      return null;

    const instruction_arg = instruction.args[arg as keyof typeof instruction.args] as IL.InstructionArg;
    const value = resolveExpression(instruction_arg, variables);
    return [arg, value]
  }).filter(x => !!x));

  return {
    type: instruction.instruction_type,
    ...args
  };
}

export const resolveExpression = (arg: IL.Expression, variables: Map<string, Word>) => {
  switch (arg.type) {
    case 'literal':
      return arg.value;
    case 'reference':
      const value = variables.get(arg.id);
      if (typeof value !== 'number') {
        console.error(variables);
        throw new Error(`Unresolved variable: "${arg.id}"`);
      }
      return value;
    default:
      throw new Error(`Cannot resolve instruction arg of type: "${arg.type}"`)
  }
}