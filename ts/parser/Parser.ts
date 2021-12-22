import Token from "../lexer/Token.ts";
import ProductionRule from "./ProductionRule.ts";
import SyntaxRule from "./SyntaxRule.ts";
import { Symbol } from "./Symbol.ts";
import SyntaxParseTree from "./SyntaxParseTree.ts";

// ##################################################################### //
// ############################### Parser ############################## //
// ##################################################################### //

export default class Parser {
  syntaxRuleset: any;
  compiledRuleset: SyntaxRule;
  startSymbol: string;
  ignoreTokensNamed: string[];

  constructor(
    compiledRuleset: any,
    startSymbol: string,
    ignoreTokensNamed: string[] = []
  ) {
    this.syntaxRuleset = compiledRuleset; // the uncompiled ruleset
    this.startSymbol = startSymbol; // the symbol that the parser starts with
    this.ignoreTokensNamed = ignoreTokensNamed; // the names of the tokens that should be ignored by the parser
    this.compiledRuleset = this.compileRuleset(
      this.syntaxRuleset,
      this.startSymbol
    );
  }

  // recursively compile the given ruleset into an instance of SyntaxRule
  private compileRuleset(grammar: any, name: string): SyntaxRule {
    const rawRule = grammar.find((rule: any) => rule.name === name);
    if (!rawRule) throw new Error("No rule found with name " + name);
    return new SyntaxRule(
      name,
      Object.keys(rawRule.productionRules).map((type: any) => {
        return new ProductionRule(
          name,
          type,
          rawRule.productionRules[type].map((symbol: string) => {
            if (symbol[0] === symbol[0].toUpperCase()) {
              // non-terminal symbol → recursively compile its ruleset
              return this.compileRuleset(grammar, symbol);
            }
            // terminal symbol → create a terminal Symbol instance
            else
              return {
                name: symbol,
                isTerminal: true,
              } as Symbol;
          })
        );
      })
    );
  }

  // parses the given tokens and returns a SyntaxParseTree if successful
  parse(tokens: Token[]): SyntaxParseTree {
    // deno-lint-ignore no-this-alias
    const context = this;
    const filteredTokens = tokens.filter(function (obj) {
      return context.ignoreTokensNamed.includes(obj.name) ? false : true;
    });
    return new SyntaxParseTree(
      this.compiledRuleset.checkProductionRules(filteredTokens)
    );
  }
}