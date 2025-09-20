import { Token } from "./tokens";
import { Chars } from './chars';

export const read = (content: string): Token.Any[] => {
  let index = 0;
  const tokens: Token.Any[] = [];
  
  while (index < content.length) {
    let char = content[index];

    if (Chars.isWhitespace(char)) {
      index++;
    } else if (Chars.isLetter(char)) {
      let text = '';
      while (Chars.isLetter(char)) {
        text += char;
        char = content[++index];
      }
      tokens.push(Token.Word(text));
    } else if (Chars.isSyntax(char)) {
      if (content.slice(index, index + 2) === '//') {
        // double slash!
        index += 2;
        const commentStart = index;
        while (char !== `\n`) {
          char = content[++index];
        }
        tokens.push(Token.Comment(content.slice(commentStart, index)));
      } else {
        if (char === '=' && content[index + 1] === '>') {
          tokens.push(Token.Syntax('=>'));
          index += 2;
        } else {
          tokens.push(Token.Syntax(char));
          index++;
        }
      }
    } else if (Chars.isDigit(char)) {
      let number = '';
      while (Chars.isDigit(char) || char === '.') {
        number += char;
        char = content[++index];
      }
      tokens.push(Token.Primitive(Number(number)));
    } else if (Chars.isQuote(char)) {
      const quote_char = char;
      const string_start_index = ++index;
      char = content[index];
      while (char !== quote_char) {
        char = content[++index];
      }
      tokens.push(Token.Primitive(content.slice(string_start_index, index)));
      index++;
    } else {
      index++;
    }
  }

  tokens.push({ type: 'end-of-file' });

  return tokens;
};