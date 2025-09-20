import { AST } from "compiler/parser";
import { Struct } from "compiler/struct";
import { IL } from "./nodes";
import { id } from "../utils";
import { generateScopeStruct } from "./closure";
import exp from "constants";
import { allocateStackStruct } from "./struct";
import { writeValue } from "./memory";

export type ProgramSetup = {
  global_struct: Struct.Definition,

  current_scope_struct: Struct.Definition,

  stack_pointer_id: string,
  frame_pointer_id: string,

  global_pointer_id: string,
};

export const generateProgramIL = (program: AST): IL.Node => {
  const global_struct = generateScopeStruct('global', program.statements);
  const stack_pointer_id = id(`stack_pointer`);
  const frame_pointer_id = id(`frame_pointer`);
  const global_pointer_id = id(`frame_pointer`);

  const setup: ProgramSetup = {
    global_struct,
    current_scope_struct: global_struct,
    stack_pointer_id,
    frame_pointer_id,
    global_pointer_id,
  };

  return IL.label(`ast:${program.node_id}`, IL.list([
    // Setup the program
    IL.data(stack_pointer_id, [IL.expr.literal(0)]),
    IL.data(frame_pointer_id, [IL.expr.literal(0)]),
    IL.data(global_pointer_id, [IL.expr.literal(0)]),

    // Write the address of the global struct
    IL.autoBorrowRegister(global_struct_address => IL.list([
      allocateStackStruct(global_struct, setup, global_struct_address),
      writeValue(global_pointer_id, global_struct_address)
    ])),
    IL.list(program.statements.map(statement =>
      generateStatementIL(setup, statement)))
  ]));
};

const generateFunctionIL = (
  setup: ProgramSetup,
  func: AST.FunctionExpression,
  dest_rid: IL.InstructionArg
): IL.Node => {
  const func_id = id(`func`);

  const func_scope = generateScopeStruct(func_id, func.body);

  const func_setup: ProgramSetup = {
    ...setup,
    current_scope_struct: func_scope
  }

  return IL.list([
    IL.island(IL.label(func_id, IL.label(`ast:${func.node_id}`,
      IL.list(func.body.map(statement =>
        generateStatementIL(func_setup, statement)))
    ))),
    IL.instruction('register.put', {
      value: IL.arg.reference(func_id),
      output: dest_rid,
    })
  ]);
}

const generateStatementIL = (setup: ProgramSetup, statement: AST.Statement) => {
  return labelASTNode(statement, () => {
    switch (statement.type) {
      case 'statement:declaration':
        const address_rid = id('borrow_register');
        const value_rid = id('borrow_register');

        return IL.borrowRegister(address_rid, IL.list([
          // Get the address where we will put the init value
          //putStackFieldAddress(setup.current_scope_struct.name, setup.current_scope_struct, statement.identifier, IL.arg.reference(address_rid)),
          IL.borrowRegister(value_rid, IL.list([
            generateExpressionIL(setup, statement.init, IL.arg.reference(value_rid)),
            IL.instruction('memory.write', { address: IL.arg.reference(address_rid), value: IL.arg.reference(value_rid)}),
          ]))
        ]))
      case 'statement:expression': {
        return IL.autoBorrowRegister(discard_rid => 
          generateExpressionIL(setup, statement.expr, discard_rid),
        );
      }
      default:
        const _: never = statement;
        throw new Error(`Can't compile statement of type: "${(statement as any).type}"`);
    }
  });
}

const generateExpressionIL = (setup: ProgramSetup, expression: AST.Expression, dest_rid: IL.InstructionArg): IL.Node => {
  return labelASTNode(expression, () => {
    switch (expression.type) {
      case 'expression:function':
        return generateFunctionIL(setup, expression, dest_rid);
      case 'expression:literal:number':
        return IL.instruction('register.put', {
          value: IL.arg.literal(expression.content),
          output: dest_rid,
        });
      case 'expression:call': {
        return IL.autoBorrowRegister(call_addr => IL.list([
          generateExpressionIL(setup, expression.func, call_addr),
          IL.instruction('control.jump', {
            is_conditional: IL.arg.literal(0),
            condition: IL.arg.literal(0),
            address: call_addr,
          }),
        ]));
      };
      case 'expression:binary':
        return IL.autoBorrowRegister(left_rid => IL.list([
          generateExpressionIL(setup, expression.left, left_rid),
          generateExpressionIL(setup, expression.right, left_rid),
          generateBinaryExpressionIL(setup, expression, left_rid, dest_rid, dest_rid),
        ]));
      case 'expression:identifier': {
        const is_local =
          setup.current_scope_struct.fields.includes(expression.text);
        
        const scope_struct = is_local ? setup.current_scope_struct : setup.global_struct;

        return IL.list([
          //putStackFieldAddress(scope_struct.name, scope_struct, expression.text, dest_rid),
          IL.instruction('memory.read', { address: dest_rid, output: dest_rid })
        ])
      }
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
): IL.Node => {
  switch (expression.operator.type) {
    case 'operator:addition':
      return IL.instruction('math.add', {
        left: left_rid,
        right: right_rid,
        output: dest_rid,
      })
    case 'operator:multiplication':
      return IL.instruction('math.multiply', {
        left: left_rid,
        right: right_rid,
        output: dest_rid,
      })
    default:
      throw new Error(`Cannot build operator: "${expression.operator.type}"`)
  }
}

const labelASTNode = (node: AST.Any, withNode: () => IL.Node): IL.Node => {
  if (node.node_id)
    return IL.label(`ast:${node.node_id}`, withNode());

  return withNode();
};

