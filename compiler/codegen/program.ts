import { Core } from "isa";
import { AST } from "../ast/parser";
import { generateAlloc, generateAllocInitalizer } from "./alloc";
import { defineStruct, getStructSize } from "./struct";
import { CodegenInstruction, group, label } from "./instructions";

export const generateProgram = (node: AST.Program): CodegenInstruction[] => {
  const top_level_declarations = node.statements
    .filter(s => s.type === 'statement:declaration')

  const program_closure_def = defineStruct("program_closuure",
    top_level_declarations.map(d => d.identifier)
  );
  
  return [
    group([
      ...generateAllocInitalizer(0, 1, 2),
      Core.factory.put(getStructSize(program_closure_def), 0),
      ...generateAlloc(0, 1, 2, 3),
    ], 'program')
  ];
}
