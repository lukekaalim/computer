import { AST, Generator, IL, Token } from "compiler";

import { writeFile } from 'node:fs/promises';

import { inspect } from 'node:util';
import { register_ids, RegisterID } from "isa";

const exampleCode = `
const one = 1;
const two = 2;
const three = 3;
const three = 1 + 2;
`;

const tokens = Token.read(exampleCode)
console.log(tokens);
const ast = AST.parse(tokens);
console.log(
  inspect(ast, { depth: null, colors: true })
);
const il = IL.generate(ast);
console.log(
  inspect(il, { depth: null, colors: true })
);
const output = Generator.generate(il);
console.log(
  inspect(output.output, { depth: null, colors: true }),
);
console.log(
  inspect(output.variables, { depth: null, colors: true }),
);

export const [assembly, assembly_debug] = assemble(output);

console.log(assembly_debug)