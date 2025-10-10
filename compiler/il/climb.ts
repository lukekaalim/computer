import { AST } from "compiler/parser";
import { Struct } from "compiler/struct";
import { IL } from "./nodes";
import { id } from "../utils";
import { generateScopeStruct } from "./closure";
import exp from "constants";
import { allocateStackStruct } from "./struct";
import { writeValue } from "./memory";
import { freeStackMemory, readFromStaticAddress, writeToStaticAddress } from "./stack";
import { buildExpressionStruct } from "./expression";

export type ProgramSetup = {
  global_struct: Struct.Definition,

  current_scope_struct: Struct.Definition,
  current_scope_pointer_id: string,
  current_expression_pointer_id: string,


  stack_pointer_id: string,
  frame_pointer_id: string,

  global_pointer_id: string,
};

export const generateProgramIL = (program: AST): IL.Node => {
  const global_struct = generateScopeStruct('global', program.statements);
  const stack_pointer_id = id(`data:stack_pointer`);
  const frame_pointer_id = id(`data:frame_pointer`);
  const global_pointer_id = id(`data:global_pointer`);
  const current_scope_pointer_id = id(`data:current_scope_pointer_id`);
  const current_expression_pointer_id = id(`data:current_expression_pointer_id`);

  const setup: ProgramSetup = {
    global_struct,
    current_scope_struct: global_struct,
    stack_pointer_id,
    frame_pointer_id,
    global_pointer_id,
    current_scope_pointer_id,
    current_expression_pointer_id,
  };

  return IL.label(`ast:${program.node_id}`, IL.list([
    // Setup the program
    IL.data(stack_pointer_id, [IL.expr.reference('free_memory_start')]),
    IL.data(frame_pointer_id, [IL.expr.literal(0)]),
    IL.data(global_pointer_id, [IL.expr.literal(0)]),
    IL.data(current_scope_pointer_id, [IL.expr.literal(0)]),
    IL.data(current_expression_pointer_id, [IL.expr.literal(0)]),

    // Write the address of the global struct
    IL.autoBorrowRegister(global_struct_address => IL.list([
      allocateStackStruct(global_struct, setup, global_struct_address),
      writeValue(global_pointer_id, global_struct_address),
      writeValue(current_scope_pointer_id, global_struct_address)
    ])),
    IL.list(program.statements.map(statement =>
      generateStatementIL(setup, statement))),
    // decallocate the global struct
    freeStackMemory(setup, IL.arg.literal(Struct.sizeOf(global_struct)))
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
        // to write to a variable in the scope:
        // get the scope position
        // get the variable field offset
        
        const variable_field_offset = setup.current_scope_struct.fields.indexOf(statement.identifier);

        const expression_values_struct = buildExpressionStruct(statement.init);

        return IL.autoBorrowRegister(address_rid => IL.list([
          IL.autoBorrowRegister(offset_rid => IL.list([
            // load the static offset
            IL.instruction('register.put', { value: IL.arg.literal(variable_field_offset), output: offset_rid }),
            // load the variable scope position
            readFromStaticAddress(setup.current_scope_pointer_id, address_rid),
            // and add the two together, storing the result in the address!
            IL.instruction('math.add', { left: offset_rid, right: address_rid, output: address_rid }),
          ])),
          // allocate space on the stack for the expression intermediate values
          IL.autoBorrowRegister(expression_address_rid => IL.list([
            allocateStackStruct(expression_values_struct, setup, expression_address_rid),
            writeToStaticAddress(setup.current_expression_pointer_id, expression_address_rid),
            // Run the expression (placing the output in zero)
            IL.label(`declaration_init(${statement.identifier})`,
              generateExpressionIL(setup, statement.init, expression_address_rid, 0),
            ),
            IL.label('declaration_write', IL.list([
              // Read (index zero)'s result into the address rid
              IL.instruction('memory.read', { address: expression_address_rid, output: expression_address_rid }),
              // And write it into the declaration slot
              IL.instruction('memory.write', { address: address_rid, value: expression_address_rid }),
            ])),
          ])),
          freeStackMemory(setup, IL.arg.literal(Struct.sizeOf(expression_values_struct)))
        ]))
      case 'statement:expression': {
        throw new Error();
        return IL.autoBorrowRegister(discard_rid => 
          generateExpressionIL(setup, statement.expr, discard_rid, 0),
        );
      }
      default:
        const _: never = statement;
        throw new Error(`Can't compile statement of type: "${(statement as any).type}"`);
    }
  });
}

/**
 * Generate the IL for evaluating an expression.
 * 
 * An entire expression shares a struct in the stack, where
 * temporary values in the expression can be stored.
 * 
 * Each element of the expression should evaluate and place
 * its results in their index in the struct
 * @param setup 
 * @param expression 
 * @param expression_values_addr_rid 
 * @param expression_values_struct 
 * @param expression_values_index 
 * @returns 
 */
const generateExpressionIL = (
  setup: ProgramSetup,
  expression: AST.Expression,
  expression_values_addr_rid: IL.InstructionArg,
  expression_values_index: number
): IL.Node => {
  const getValueAddress = (address_rid: IL.InstructionArg, offset: number) => {
    return IL.autoBorrowRegisters(1, (offset_rid) => IL.list([
      // Put the offset and struct address into the register
      IL.instruction('register.put', { value: IL.arg.literal(offset), output: offset_rid }),
      // compute where we should store the value
      IL.instruction('math.add', { left: offset_rid, right: expression_values_addr_rid, output: address_rid }),
    ]))
  }
  const writeValue = (value_rid: IL.InstructionArg) => {
    return IL.autoBorrowRegisters(1, (address_rid) => IL.list([
      getValueAddress(address_rid, expression_values_index),
      // And write it!
      IL.instruction('memory.write', { address: address_rid, value: value_rid }),
    ]))
  }

  return labelASTNode(expression, () => {
    switch (expression.type) {
      case 'expression:function':
        return IL.list([]);
        return generateFunctionIL(setup, expression, dest_addr_rid);
      case 'expression:literal:number':
        const number_literal_id = id('data:number_literal');
        return IL.list([
          // store the constant somewhere in data
          IL.data(number_literal_id, [IL.arg.literal(expression.content)]),

          IL.autoBorrowRegisters(1, (value_rid) => IL.list([
            // Put address constant in the register
            IL.instruction('register.put', { value: IL.arg.reference(number_literal_id), output: value_rid }),
            // Read the constant
            IL.instruction('memory.read', { address: value_rid, output: value_rid }),
            // Write the constsnt
            writeValue(value_rid),
          ])),
        ])
      case 'expression:call': {
        return IL.list([]);
        return IL.autoBorrowRegister(call_addr => IL.list([
          generateExpressionIL(setup, expression.func, call_addr, 0),
          IL.instruction('control.jump', {
            is_conditional: IL.arg.literal(0),
            condition: IL.arg.literal(0),
            address: call_addr,
          }),
        ]));
      };
      case 'expression:binary':
        // know we are allowed to store our result

        // evaluate our left hand side, and store it inside
        // our temporary slot

        return IL.list([
          IL.label('LHS',
            generateExpressionIL(setup, expression.left, expression_values_addr_rid, expression_values_index),
          ),
          IL.label('RHS',
            generateExpressionIL(setup, expression.right, expression_values_addr_rid, expression_values_index + 1),
          ),
          IL.autoBorrowRegisters(2, (left, right) => IL.list([
            getValueAddress(left, expression_values_index),
            getValueAddress(right, expression_values_index + 1),
            IL.instruction('memory.read', { address: left, output: left }),
            IL.instruction('memory.read', { address: right, output: right }),
            generateBinaryExpressionIL(setup, expression, left, right, left),
            getValueAddress(right, expression_values_index),
            IL.instruction('memory.write', { address: right, value: left }),
          ])),

        ]);
      case 'expression:identifier': {
        //const is_local =
        //  setup.current_scope_struct.fields.includes(expression.text);
        
        //const scope_struct = is_local ? setup.current_scope_struct : setup.global_struct;

        return IL.autoBorrowRegisters(2, (a, b) => IL.list([
          IL.instruction('register.put', { value: IL.arg.reference(setup.global_pointer_id), output: a }),
          // a now has the pointer to the global struct
          IL.instruction('memory.read', { address: a, output: a }),
          IL.instruction('register.put', { value: IL.arg.literal(
            Struct.fieldOffset(setup.global_struct, expression.text)
          ), output: b }),
          IL.instruction('math.add', { left: a, right: b, output: a }),
          // A now has the value
          IL.instruction('memory.read', { address: a, output: a }),
          writeValue(a),
        ]))
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

