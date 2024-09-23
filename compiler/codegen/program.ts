import { Core } from "isa";
import { AST } from "../ast/parser";
import { generateAlloc, generateAllocInitalizer } from "./alloc";
import { defineStruct, getStructSize } from "./struct";
import { CodegenInstruction, group, label } from "./instructions";
import { generateStatement } from "./gen/statement";

export const generateProgram = (node: AST.Program): CodegenInstruction[] => {
  const top_level_declarations = node.statements
    .filter(s => s.type === 'statement:declaration')

  const program_closure_def = defineStruct("program_closure",
    top_level_declarations.map(d => d.identifier)
  );
  
  const statement_instructions = node.statements.flatMap(statement => {
    return generateStatement(statement, 1, program_closure_def, 2, 3, 4, 5)
  })
  
  return [
    group([
      // init
      ...generateAllocInitalizer(0, 1, 2),
      
      // allocate program closure
      Core.factory.put(getStructSize(program_closure_def), 0),
      ...generateAlloc(0, 1, 2, 3),

      // run program
      ...statement_instructions,
    ], 'program')
  ];
}
