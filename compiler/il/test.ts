import { read } from "compiler/lexer";
import { createTokenStream, parseProgram } from "compiler/parser";
import { climb } from "./mod";
import { inspect } from "util";

const source = `
const main = () => {
  const a = 0;
  const b = 10;
  const c = a + b;
};

main();
`;

const tokens = read(source);

const ast = parseProgram(createTokenStream(tokens));

const il = climb.generateProgramIL(ast);

console.log(inspect(il, { colors: true, depth: null }));