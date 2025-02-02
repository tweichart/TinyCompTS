import Token from "./Token.ts";
import { InvalidCharacterError } from "./LexerError.ts";
import LexicalRuleset from "../attributeGrammar/lexicalRuleset.ts";

// ##################################################################### //
// ############################### Lexer ############################### //
// ##################################################################### //

// Lexer, which converts a string into a stream of tokens.
// The lexer is implemented as a finite state machine and uses lexical rules defined in lexicalRules to determine valid tokens.

export default class Lexer {
  lexicalRules: LexicalRuleset;

  constructor(lexerGrammar: LexicalRuleset) {
    this.lexicalRules = lexerGrammar;
  }

  // transforms a string into an array of tokens
  tokenize = (input: string) => {
    let pos = 0,
      line = 1,
      char = 0;

    const tokens = [];

    while (pos < input.length) {
      const matchResult = this.#matchNextToken(input, pos, line, char);
      const match = matchResult?.token;

      if (match) {
        // push token to tokens and update pos, line, char
        tokens.push(match);
        ({ pos, line, char } = matchResult);
      } else throw new InvalidCharacterError(input, pos, line, char);
    }
    return tokens;
  };

  // tries to return the next token in the input string
  #matchNextToken = (
    input: string,
    pos: number,
    line: number,
    char: number
  ): any => {
    let match = {
      name: "",
      token: "",
    };

    // Check if we have matches, and if so, return the longest one → maximum munch algorithm
    for (const [ruleName, rule] of Object.entries(this.lexicalRules)) {
      const r = new RegExp("^" + rule.regex.source),
        token = r.exec(input.substr(pos));

      // set result as new match if it's longer
      if (token && token[0].length > match.token.length) {
        match = {
          name: ruleName,
          token: token[0],
        };
      }
    }

    // Update pos, line, char
    if (match.name != null) {
      if (match.name === "newline") {
        line++;
        char = 0;
      } else char += match.token.length;
      pos += match.token.length;
      return {
        token: new Token(match.name, match.token, line, char),
        pos,
        line,
        char,
      };
    } else return null;
  };
}
