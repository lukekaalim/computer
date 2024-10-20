import { inspect } from "util";
import { read } from "../lexer/read";
import { parseProgram } from "./program";
import { createTokenStream } from "./stream";
import { parse } from "./parse";

const source = `
const a = 10;
const b = a + 2;
const c = () => {
  const d = 20;
  const e = d + 10;
};

c();
`;

const tokens = read(source);
const ast = parse(tokens)

console.log(inspect(ast, { colors: true, depth: null }));