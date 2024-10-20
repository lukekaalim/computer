import { Token } from "../mod";

export type TokenStream = {
  read(): Token.Any,
  peek(): Token.Any,

  /**
   * Read and test value, throwing an error if the test does
   * not pass
   * @param type
   * @param test 
   */
  assert<T extends Token.Any["type"]>(
    type: T,
    test?: (token: Extract<Token.Any, { type: T}>) => boolean
  ): Extract<Token.Any, { type: T}>,

  tryFork<T>(withFork: (forkedStream: TokenStream) => T): T | null
};

export const createTokenStream = (source: Token.Any[]): TokenStream => {
  let index = 0;

  const stream: TokenStream = {
    read() {
      return source[index++];
    },
    peek() {
      return source[index];
    },
    assert(type, test) {
      const token = source[index++];
      if (token.type === type && (!test || test(token as any)))
        return token as any;
      
      throw new Error();
    },
    tryFork(withFork) {
      const prevPosition = index;
      try {
        return withFork(stream)
      } catch {
        index = prevPosition;
        return null;
      }
    },
  }

  return stream;
}