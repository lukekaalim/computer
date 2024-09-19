export namespace Token {
  export type Word = { type: 'word', text: string };
  export type Primitive = { type: 'primitive', contents: string | number };
  export type Syntax = { type: 'syntax', syntax: Chars.Syntax }
  export type NewLine = { type: 'newline' };
  export type Comment = { type: 'comment', text: string };
  export type EndOfFile = { type: 'end-of-file' };

  export type Any =
    | Word
    | Primitive
    | Syntax
    | NewLine
    | Comment
    | EndOfFile
}

export namespace Chars {
  export const letters = [
    'a', 'b', 'c', 'd', 'e', 'f', 'h', 'h', 'i', 'j', 'k', 'l',
    'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x',
    'y', 'z', '_'
  ] as const;
  export type Letter = typeof letters[number];
  export const digits = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
  ] as const;
  export type Digit = typeof digits[number];
  export const quotes = [
    `'`, `"`, `\``
  ] as const;
  export type Quote = typeof quotes[number];
  export const syntax = [
    '+', '-', '=', ';', '*', '/'
  ] as const;
  export type Syntax = typeof syntax[number];
  export const whitespace = [
    ' ', '\t', '\n'
  ] as const;
  export type WhitespaceChar = typeof whitespace[number];

  export const isWhitespace = (char: string): char is WhitespaceChar => (Chars.whitespace as readonly string[]).includes(char);
  export const isLetter = (char: string): char is Letter => (Chars.letters as readonly string[]).includes(char);
  export const isDigit = (char: string): char is Digit => (Chars.digits as readonly string[]).includes(char);
  export const isSyntax = (char: string): char is Syntax => (Chars.syntax as readonly string[]).includes(char);
  export const isQuote = (char: string): char is Quote => (Chars.quotes as readonly string[]).includes(char);
}


export const parse = (content: string) => {
  let index = 0;
  const tokens: Token.Any[] = [];
  
  while (index < content.length) {
    let char = content[index];

    if (Chars.isWhitespace(char)) {
      // skip
      if (char === '\n')
        tokens.push({ type: 'newline' });
      index++;
    } else if (Chars.isLetter(char)) {
      let text = '';
      while (Chars.isLetter(char)) {
        text += char;
        char = content[++index];
      }
      tokens.push({ type: 'word', text });
    } else if (Chars.isSyntax(char)) {
      if (content.slice(index, index + 2) === '//') {
        // double slash!
        index += 2;
        const commentStart = index;
        while (char !== `\n`) {
          char = content[++index];
        }
        tokens.push({ type: 'comment', text: content.slice(commentStart, index) });
      } else {
        tokens.push({ type: 'syntax', syntax: char });
        index++;
      }
    } else if (Chars.isDigit(char)) {
      let number = '';
      while (Chars.isDigit(char) || char === '.') {
        number += char;
        char = content[++index];
      }
      tokens.push({ type: 'primitive', contents: Number(number) });
    } else if (Chars.isQuote(char)) {
      const quote_char = char;
      const string_start_index = ++index;
      char = content[index];
      while (char !== quote_char) {
        char = content[++index];
      }
      tokens.push({ type: 'primitive', contents: content.slice(string_start_index, index) });
      index++;
    } else {
      index++;
    }
  }

  tokens.push({ type: 'end-of-file' });

  return tokens;
};
