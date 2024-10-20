import { Chars } from "./chars";

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
    //| NewLine
    | Comment
    | EndOfFile
  
  export const read = (content: string): Token.Any[] => {
    let index = 0;
    const tokens: Token.Any[] = [];
    
    while (index < content.length) {
      let char = content[index];

      if (Chars.isWhitespace(char)) {
        // skip
        //if (char === '\n')
          //tokens.push({ type: 'newline' });
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
}
