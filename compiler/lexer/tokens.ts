import { Chars } from "./chars";

export namespace Token {
  export type Word = { type: 'word', text: string };
  export const Word = (text: string): Word => ({ type: 'word', text });

  export type Primitive = { type: 'primitive', contents: string | number };
  export const Primitive = (contents: string | number): Primitive => ({ type: 'primitive', contents });

  export type Syntax = { type: 'syntax', syntax: Chars.Syntax }
  export const Syntax = (syntax: Chars.Syntax): Syntax => ({ type: 'syntax', syntax });
  
  export type Comment = { type: 'comment', text: string };
  export const Comment = (text: string): Comment => ({ type: 'comment', text });
  export type EndOfFile = { type: 'end-of-file' };
  export const EndOfFile = (): EndOfFile => ({ type: 'end-of-file' });

  export type Any =
    | Word
    | Primitive
    | Syntax
    | Comment
    | EndOfFile
}

export type Token = Token.Any;