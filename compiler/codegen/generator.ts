import { register_ids, RegisterID } from "isa";
import { IL } from "compiler/il";

import { Variable } from "./variables";
import { Span } from "./span";
import { StackEntry } from "./stack";

export namespace Generator {
  export type State = {
    free_registers: RegisterID[],
    variables: Map<string, Variable>,
  
    stack_entries: StackEntry[],
    stack_offset: number,
  
    groups: Span[],
    il_node_spans: Span[],
    path: string[],
  
    index: number,
    il_index: number,
    ast_index: number,
  
    output: IL.InstructionNode[],
  }
  export const createNewState = (): State => ({
    free_registers: [...register_ids],
    variables: new Map(),
  
    stack_entries: [],
    stack_offset: 0,

    il_index: 0,
    ast_index: 0,
  
    groups: [],
    il_node_spans: [],
    path: [],
    index: 0,
    output: [],
  })

  const run = (state: State, node: IL.Node) => {
    const recordNodeSpan = (generateInsideSpan: () => void) => {
      const start = state.index;

      generateInsideSpan();

      const end = state.index;
      
      //state.il_node_spans.push({ id: state.path.join('.'), start, end });
    };
    const descendPath = (pathPart: string, generateInsidePath: () => void) => {
      state.path.push(pathPart);
      generateInsidePath();
      state.path.pop();
    }

    recordNodeSpan(() => {
      switch (node.type) {
        case 'borrow-register': {
          const register = state.free_registers.pop();
          if (!register)
            throw new Error(`Cannot borrow register - exhausted all available registers`);

          state.variables.set(node.id, { id: node.id, value: register });

          descendPath(`br`, () => {
            run(state, node.withRegister);
          });

          state.free_registers.push(register);
          return;
        }
        case 'instruction': {
          state.output.push(node);
          state.index++;
          return;
        }
        case 'list': {
          for (let i = 0; i < node.nodes.length; i++) {
            descendPath(`[${i}]`, () => {
              run(state, node.nodes[i]);
            })
          }
          return;
        }
        case 'label': {
          const start = state.index;
          descendPath(`${node.id}`, () => {
            run(state, node.withLabel);
          })
          const end = state.index;
          state.groups.push({ id: node.id, start, end });
          return;
        }
        case 'stack': {
          const offset = state.stack_offset;
          state.stack_offset += node.size;
          state.stack_entries.push({ size: node.size, offset, id: node.label })

          descendPath(`s`, () => {
            run(state, node.withStackedValue);
          })

          state.stack_offset -= node.size;
          return;
        }
        default:
          throw new Error(`Cannot generate code for node: "${node.type}"`)
      }
    })
  }

  export const generate = (root: IL.Node): State => {
    const state = createNewState();
    run(state, root);
    return state;
  }
}


