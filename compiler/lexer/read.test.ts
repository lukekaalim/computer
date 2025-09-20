import { describe, it } from "node:test";

describe('lexer.read()', () => {
  it('should read a basic file', () => {
    const srcCode = `
      const main = () => {
        console.log(addNumbers());
      }
    
      const add_numbers = () => {
        const left = 10;
        const right = 20;
        const result = left + right;

        return result;
      }
    `;
    const expectedTokens = [
      
    ]
  })
});
