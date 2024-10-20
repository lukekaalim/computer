import { compile } from "./compile";

const exampleCode = `
const main = () => {
  const one = 1;
};

main();
`;

const [exec, debug] = compile(exampleCode)

console.log(debug.exec_debug.instructions)
console.log(exec)