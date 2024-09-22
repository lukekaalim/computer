import { inspect } from "util";
import { parse } from "./ast/token";
import { createSyntaxTree } from "./ast/parser";
import { generateProgram } from './codegen/mod'
import { assemble } from "./link/assemble";

const exampleCode = `
// a cool comment
const first = 100;
const second = 2;

const addition_result = 1 + 2; // 3
const multiplication_result = 2 * 2; // 4
const hello = "world";
`;

const tokens = parse(exampleCode);
const tree = createSyntaxTree(tokens.filter(t => t.type !== 'comment')).readProgram();
const program = generateProgram(tree);
export const assembly = assemble(program);

console.log(tokens);
console.log(
  inspect(tree, { depth: null, colors: true })
);
console.log(program);
console.log(assembly);
