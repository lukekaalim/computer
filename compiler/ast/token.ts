export type Token =
  | { type: 'word', text: string }
  | { type: 'literal', contents: string }
  | { type: 'syntax', syntax: ';' | '=' | '`' | '+' | '*' }

const stringToCharList = <T extends string>(value: T): (typeof value)["length"] => {
  return value.length;
}

type A = [0, 1];
type C = A["length"]


const letters = [
  'a', 'b', 'c', 'd', 'e', 'f', 'h', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z'
] as const;
const numbers = [...'0123456789'];
const syntax = [...'+-=*;'];
const whitespace = [...' \n\t'];

export const parse = (content: string) => {
  let index = 0;
  const tokens: Token[] = [];
  
  while (index < content.length) {
    let char = content[index];

    if (whitespace.includes(char)) {
      // skip
      index++;
    } else if (letters.includes(char)) {
      let text = '';
      while (!whitespace.includes(char) && !syntax.includes(char)) {
        let char = content[index];
        text += char;
        index++;
      }
      tokens.push({ type: 'word', text });
    } else if (syntax.includes(char)) {
      tokens.push({ type: 'syntax', syntax: char });
    } else {
      index++;
    }
  }

  return tokens;
};

const exampleCode = `
const first = 1;
const second = 2;

const addition_result = 1 + 2;
const multiplication_result = 1 * 2;
const hello = \`World\`;
`;

console.log(parse(exampleCode));