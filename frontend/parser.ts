import {
	Expr,
	Binding,
	Function,
	LetExpr,
	WithExpr,
	MemberExpr,
	CallExpr,
	BinaryExpr,
	List,
	Set,
	NUmber,
	Identifier,
} from "./ast.ts";

import { Token, TokenType, tokenize } from "./lexer.ts";

// Parser to producing an abstract syntax tree from source code
export default class Parser {
	private tokens: Token[] = [];

	private eof(): boolean {
		return this.tokens[0].type == TokenType.EOF;
	}

	private at(): Token {
		return this.tokens[0];
	}

	private eat(): Token {
		return this.tokens.shift();
	}

	private expect(type: TokenType, err: any): Token {
		const token = this.tokens.shift();
		if (!token || token.type != type) {
			throw `Parser error: ${err}; Got: ${token}; Expecting: ${type}`;
		}
		return token;
	}	

	// parse source code to produce an abstract syntax tree
	public parse(s: string): Expr[] {
		this.tokens = tokenize(s);
		let exprs: Expr[];	
		while (!this.eof()) {
				exprs.push(this.parse_expr());	
		}
		return exprs;
	}

	private parse_expr(): Expr {
		
	}

}
