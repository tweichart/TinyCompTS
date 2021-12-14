import AST from "../parser/AST";
import Token from "../lexer/Token";
import { AttributedSymbol } from "../parser/Symbol";

// Attributed abstract syntax tree
export default class AAST extends AST implements AttributedSymbol {
  // implement AttributedSymbol interface
  value: any;

  // override AST.childNodes type
  childNodes: AttributedSymbol[];

  // AAST specific attributes
  semanticRule: (...args: any) => any;
  attributeGrammar: any;

  constructor(ast: AST, attributeGrammar: any) {
    super(ast.productionRule, ast.childNodes);

    this.semanticRule = this.findSemanticRule(attributeGrammar, ast);
    this.attributeGrammar = attributeGrammar;

    this.childNodes = this.mapChildNodes(ast);
    this.value = this.semanticRule(...this.childNodes);
  }

  mapChildNodes(ast: AST): (AAST | Token)[] {
    return ast.childNodes.map((r) => {
      if (r.isTerminal) {
        return r as Token;
      } else {
        return new AAST(r as AST, this.attributeGrammar);
      }
    });
  }

  findSemanticRule(
    attributeGrammar: any,
    parseResult: AST
  ): (...args: any) => any {
    const f =
      attributeGrammar[parseResult.productionRule.ruleName][
        parseResult.productionRule.type
      ];
    if (f) return f;
    else
      throw new Error(
        "no semantic rule found for rule: " +
          parseResult.productionRule.ruleName +
          " type: " +
          parseResult.productionRule.type
      );
  }
}