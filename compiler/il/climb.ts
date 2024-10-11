import { AST } from "compiler/ast";
import { Struct } from "compiler/struct";
import { IL } from "./nodes";
import { allocStackStruct, putStackFieldAddress } from "./stack";
import { id } from "../utils";

export type ProgramSetup = {
  global_struct: Struct.Definition,
};

export const generateProgramIL = (program: AST): IL.Node => {
  const var_names = program.statements.map(s => {
    switch (s.type) {
      case 'statement:declaration':
        return s.identifier;
      default:
        return null;
    }
  }).filter((n): n is string => !!n);

  const global_struct = Struct.define('globals', var_names);
  const setup = { global_struct };

  return IL.label(`ast:${program.node_id}`,
    allocStackStruct(global_struct, 'global',
      IL.list(program.statements.map(statement =>
        generateStatementIL(setup, statement)))
    )
  );
};

const generateStatementIL = (setup: ProgramSetup, statement: AST.Statement) => {
  return labelASTNode(statement, () => {
    switch (statement.type) {
      case 'statement:declaration':
        const address_rid = id('borrow_register');
        const value_rid = id('borrow_register');

        return IL.borrowRegister(address_rid, IL.list([
          // Get the address where we will put the init value
          putStackFieldAddress('global', setup.global_struct, statement.identifier, IL.arg.reference(address_rid)),
          IL.borrowRegister(value_rid, IL.list([
            generateExpressionIL(setup, statement.init, IL.arg.reference(value_rid)),
            IL.instruction('memory.write', { address: IL.arg.reference(address_rid), value: IL.arg.reference(value_rid)}),
          ]))
        ]))
      default:
        throw new Error(`Can't compile statement of type: "${statement.type}"`);
    }
  });
}

const generateExpressionIL = (setup: ProgramSetup, expression: AST.Expression, dest_rid: IL.InstructionArg): IL.Node => {
  return labelASTNode(expression, () => {
    switch (expression.type) {
      case 'expression:literal:number':
        return IL.instruction('register.put', {
          value: IL.arg.literal(expression.content),
          output: dest_rid,
        });
      case 'expression:binary':
        return IL.autoBorrowRegister(left_rid => IL.list([
          generateExpressionIL(setup, expression.left, left_rid),
          generateExpressionIL(setup, expression.right, left_rid),
          generateBinaryExpressionIL(setup, expression, left_rid, dest_rid, dest_rid),
        ]));
      case 'expression:identifier':
        return IL.list([
          putStackFieldAddress('global', setup.global_struct, expression.id, dest_rid),
          IL.instruction('memory.read', { address: dest_rid, output: dest_rid })
        ])
      default:
        throw new Error(`Can't compile expression of type: "${expression.type}"`);
    }
  });
}

const generateBinaryExpressionIL = (
  setup: ProgramSetup,
  expression: AST.BinaryExpression,

  left_rid: IL.InstructionArg,
  right_rid: IL.InstructionArg,

  dest_rid: IL.InstructionArg
) => {
  switch (expression.operator.type) {
    case 'addition':
      return IL.instruction('math.add', {
        left: left_rid,
        right: right_rid,
        output: dest_rid,
      })
    case 'multiplication':
      return IL.instruction('math.multiply', {
        left: left_rid,
        right: right_rid,
        output: dest_rid,
      })
  }
}

const labelASTNode = (node: AST.Any, withNode: () => IL.Node): IL.Node => {
  if (node.node_id)
    return IL.label(`ast:${node.node_id}`, withNode());

  return withNode();
};
