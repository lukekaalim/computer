export type Token =
  | { type: 'word', text: string }
  | { type: 'primitive', contents: string | number }
  | { type: 'syntax', syntax: Syntax }
  | { type: 'newline' }

const stringToCharList = <T extends string>(value: T): (typeof value)["length"] => {
  return value.length;
}

type A = [0, 1];
type C = A["length"]


const letters = [
  'a', 'b', 'c', 'd', 'e', 'f', 'h', 'h', 'i', 'j', 'k', 'l',
  'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
  'y', 'z', '_'
] as const;
type Letter = typeof letters[number];
const digits = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
] as const;
type Digit = typeof digits[number];
const syntax = [
  '+', '-', '=', ';', '*', '`'
] as const;
type Syntax = typeof syntax[number];
const whitespace = [
  ' ', '\t', '\n'
] as const;
type Whitespace = typeof whitespace[number];

export const parse = (content: string) => {
  let index = 0;
  const tokens: Token[] = [];
  
  while (index < content.length) {
    let char = content[index];

    const isWhitespace = (char: string): char is Whitespace => (whitespace as readonly string[]).includes(char);
    const isLetter = (char: string): char is Letter => (letters as readonly string[]).includes(char);
    const isDigit = (char: string): char is Digit => (digits as readonly string[]).includes(char);
    const isSyntax = (char: string): char is Syntax => (syntax as readonly string[]).includes(char);

    if (isWhitespace(char)) {
      // skip
      if (char === '\n')
        tokens.push({ type: 'newline' });
      index++;
    } else if (isLetter(char)) {
      let text = '';
      while (isLetter(char)) {
        text += char;
        char = content[++index];
      }
      tokens.push({ type: 'word', text });
    } else if (isSyntax(char)) {
      tokens.push({ type: 'syntax', syntax: char });
      index++;
    } else if (isDigit(char)) {
      let number = '';
      while (isDigit(char) || char === '.') {
        number += char;
        char = content[++index];
      }
      tokens.push({ type: 'primitive', contents: Number(number) });
    } else {
      console.log('SKIP', char)
      index++;
    }
  }

  return tokens;
};

const exampleCode = `
const first = 100;
const second = 2;

const addition_result = 1 + 2;
const multiplication_result = 1 * 2;
const hello = \`world\`;
`;

console.log(parse(exampleCode));