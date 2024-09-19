import { inspect } from "util";
import { parse } from "./token";
import { createSyntaxTree } from "./tree";

const exampleCode = `
// a cool comment
const first = 100;
const second = 2;

const addition_result = 1 + 2; // 3
const multiplication_result = 2 * 2; // 4
const hello = "world";
`;

const tokens = parse(exampleCode);
const tree = createSyntaxTree(tokens.filter(t => t.type !== 'comment'));


console.log(tokens);
console.log(
  inspect(tree.readProgram(), { depth: null, colors: true })
);