import { Chars } from "./chars";

export namespace Token {
  export type Word = { type: 'word', text: string };
  export type Primitive = { type: 'primitive', contents: string | number };
  export type Syntax = { type: 'syntax', syntax: Chars.Syntax }
  
  export type Comment = { type: 'comment', text: string };
  export type EndOfFile = { type: 'end-of-file' };

  export type Any =
    | Word
    | Primitive
    | Syntax
    | Comment
    | EndOfFile
}

export type Token = Token.Any;