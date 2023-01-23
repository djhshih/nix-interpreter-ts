import {
	NodeType,
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
	Number,
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

	private until(token_type: TokenType) {
		return !this.eof() && this.at().type != token_type;
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
		switch (this.at().type) {
			case TokenType.Let:
				return this.parse_let_expr();
			case TokenType.With:
				return this.parse_with_expr();
			default:
				return this.parse_simple_expr();
		}
	}

	private parse_let_expr(): LetExpr {
		this.eat();  // eat let
		let expr: LetExpr = { type: NodeType.LetExpr, declarations: [], body: null };
		while (this.until(TokenType.In)) {
			expr.declarations.push(this.parse_binding());
		}
		this.expect(TokenType.In, "Let expression must have an 'in'");
		expr.body = this.parse_expr();
		return expr;
	}

	private parse_with_expr(): WithExpr {
		this.eat();  // eat with
		let env;
		switch (this.at().type) {
			case TokenType.Identifier: {
				env = this.parse_identifier();
			}
			case TokenType.OpenBrace: {
				env = this.parse_set();
			}
			default:
				throw "With expression must begin with an identifier or set";
		}
		let expr: WithExpr = {
			type: NodeType.WithExpr,
			env: env,
			body: this.parse_expr()
		};
		return expr;
	}

	private parse_binding(): Binding {
		const binding: Binding = {
			type: NodeType.Binding,
			identifier: this.parse_identifier(),
			value: null
		};
		this.expect(TokenType.Equal, "Binding must contain '='");
		binding.value = this.parse_term();
		this.expect(TokenType.Semicolon, "Binding must end in ';'");
		return binding;
	}

	private parse_simple_expr(): Expr {

	}

	private parse_additive_expr(): Expr {

	}

	private parse_multiplicative_expr(): Expr {

	}

	private parse_term(): Expr {
		switch (this.at().type) {

			case TokenType.Number:
				return {
					type: NodeType.Number, value: parseFloat(this.eat().value)
				} as Number;

			case TokenType.Identifier: {
				const id = this.parse_identifier();
				// check if the identifier is part of a function declaration
				if (this.at().type == TokenType.Colon) {
					return this.parse_function(id);
				} else {
					return id;
				}
			}

			// List
			case TokenType.OpenBracket:
				return this.parse_list();

			// TODO Support set pattern for function declaration
			//      We need to distinguish between a set and a set pattern somehow

			// Set
			case TokenType.OpenBrace:
				return this.parse_set();

			// grouping expression
			case TokenType.OpenParen:
				return this.parse_group();

			default:
				throw "Unexpected token found: " + this.at();
		}
	}

	private parse_identifier(): Identifier {
		return { type: NodeType.Identifier, name: this.eat().value };
	}

	private parse_list(): List {
			this.eat();  // eat open bracket
			const list: List = { type: NodeType.List, elements: [] };
			while (this.until(TokenType.CloseBracket)) {
				list.elements.push(this.parse_term());
			}
			this.expect(TokenType.CloseBracket, "List is not closed");
			return list;
	}

	private parse_set(): Set {
		this.eat();  // eat open brace
		const set: List = { type: NodeType.Set, elements: {} };
		while (this.until(TokenType.CloseBracket)) {
			const binding = this.parse_binding();
			set[binding.identifier] = binding.value;
		}
		this.expect(TokenType.CloseBrace, "Set is not closed");
		return set;
	}

	private parse_group(): Expr {
		this.eat();  // eat open parenthesis
		const value = this.parse_expr();
		this.expect(
			TokenType.CloseParen,
			"Parenthetic expression is not closed"
		);
		return value;
	}

	// assumes that param has been parsed already
	private parse_function(param: Expr): Function {
		this.eat();  // eat colon
		const body = this.parse_expr();
		const f: Function = { type: NodeType.Function, param, body };
		return f;
	}

}
