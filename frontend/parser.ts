import { Token, TokenType, tokenize } from "./lexer.ts";

import {
	NodeType,
	ExprN,
	BindingN,
	FunctionN,
	LetExprN,
	WithExprN,
	IfExprN,
	SelectExprN,
	ApplyExprN,
	ParamsN,
	BinaryExprN,
	ListN,
	SetN,
	NumberN,
	IdentifierN,
} from "./ast.ts";


// Parser to producing an abstract syntax tree from source code
export default class Parser {
	private tokens: Token[] = [];

	private eof(): boolean {
		return this.tokens[0].type == TokenType.EOF;
	}

	private at(i = 0): Token {
		return this.tokens[i];
	}

	private until(token_type: TokenType) {
		return !this.eof() && this.at().type != token_type;
	}

	private find(token_type: TokenType, end = 0) {
		if (end <= 0 || end > this.tokens.length) {
			end = this.tokens.length;
		}
		for (let i = 0; i < end; i++) {
			if (this.tokens[i].type == token_type) {
				return i;
			}
		}
		return -1;
	}

	private eat(): Token {
		return this.tokens.shift() as Token;
	}

	private expect(type: TokenType, err: any): Token {
		const token = this.tokens.shift();
		if (!token || token.type != type) {
			console.error("tokens: ", this.tokens);
			throw `Parsing failed: ${err}. Got '${token.value}' but expecting '${type}'`;
		}
		return token;
	}	

	// parse source code to produce an abstract syntax tree
	public parse(s: string): ExprN[] {
		this.tokens = tokenize(s);
		let exprs: ExprN[] = [];	
		while (!this.eof()) {
				exprs.push(this.parse_expr());	
		}
		return exprs;
	}

	private parse_expr(): ExprN {
		switch (this.at().type) {
			case TokenType.Let:
				return this.parse_let_expr();
			case TokenType.With:
				return this.parse_with_expr();
			case TokenType.If:
				return this.parse_if_expr();
			default:
				return this.parse_simple_expr();
		}
	}

	private parse_let_expr(): LetExprN {
		this.eat();  // eat let
		let declarations = [];
		while (this.until(TokenType.In)) {
			declarations.push(this.parse_binding());
		}
		this.expect(TokenType.In, "Let expression must have an 'in'");
		let body = this.parse_expr();
		return { type: NodeType.LetExpr, declarations, body };
	}

	private parse_with_expr(): WithExprN {
		this.eat();  // eat with
		let env;
		switch (this.at().type) {
			case TokenType.Identifier: {
				env = this.parse_identifier();
				break;
			}
			case TokenType.OpenBrace: {
				env = this.parse_set();
				break;
			}
			default:
				console.error("tokens: ", this.tokens);
				throw "With expression must begin with an identifier or set";
		}
		this.expect(TokenType.Semicolon, "With expression must be delimited by ';'");
		let expr: WithExprN = {
			type: NodeType.WithExpr,
			env: env,
			body: this.parse_expr()
		};
		return expr;
	}

	private parse_if_expr(): IfExprN {
		this.eat();  // eat if
		let condition = this.parse_expr();
		this.expect(TokenType.Then, "If expression must have an 'then'")
		let left = this.parse_expr();
		this.expect(TokenType.Else, "If expression must have an 'else'")
		let right = this.parse_expr();
		return {
			type: NodeType.IfExpr,
			left,
			right,
		};
	}

	// inherit = true allows right-hand side to be inherited
	private parse_binding(inherit = false): BindingN {
		const identifier = this.parse_identifier();
		let value;
		if (inherit && this.at().type == TokenType.Semicolon) {
			value = identifier;
			this.eat();
		} else {
			this.expect(TokenType.Equal, "Binding must contain '='");
			value = this.parse_expr();
			this.expect(TokenType.Semicolon, "Binding must end in ';'");
		}
		return {
			type: NodeType.Binding,
			identifier,
			value,
		} as BindingN;
	}

	private parse_simple_expr(): ExprN {
		return this.parse_comparative_expr();
	}

	private parse_comparative_expr(): ExprN {
		let left = this.parse_additive_expr();

		while (
			this.at().value == ">" ||
			this.at().value == "<" ||
			this.at().value == ">=" ||
			this.at().value == "<=" ||
			this.at().value == "==" ||
			this.at().value == "!="
		) {
			const op = this.eat().value;
			const right = this.parse_additive_expr();
			left = {
				type: NodeType.BinaryExpr,
				left,
				right,
				op,
			} as BinaryExprN;
		}

		return left;
	}

	private parse_additive_expr(): ExprN {
		let left = this.parse_multiplicative_expr();

		while (
			this.at().value == "+" ||
			this.at().value == "-"
		) {
			const op = this.eat().value;
			const right = this.parse_multiplicative_expr();
			left = {
				type: NodeType.BinaryExpr,
				left,
				right,
				op,
			} as BinaryExprN;
		}

		return left;
	}

	private parse_multiplicative_expr(): ExprN {
		let left = this.parse_apply_expr();

		while (
			this.at().value == "/" ||
			this.at().value == "*"
		) {
			const op = this.eat().value;
			const right = this.parse_apply_expr();
			left = {
				type: NodeType.BinaryExpr,
				left,
				right,
				op,
			} as BinaryExprN;	
		}

		return left;
	}

	private parse_apply_expr(): ExprN {
		let expr = this.parse_select_expr();

		// only the below node types can potentially have a callable function
		if (
			expr.type != NodeType.Function && 
			expr.type != NodeType.Identifier &&
			expr.type != NodeType.WithExpr &&
			expr.type != NodeType.LetExpr &&
			expr.type != NodeType.SelectExpr &&
			expr.type != NodeType.ApplyExpr
		) {
			return expr;
		}

		// only do function application if next token is a permissible operand
		while (
			this.at().type == TokenType.Identifier ||
			this.at().type == TokenType.Number ||
			this.at().type == TokenType.Path ||
			this.at().type == TokenType.OpenParen ||     // expr
			this.at().type == TokenType.OpenBracket ||   // list
			this.at().type == TokenType.OpenBrace        // set
		) {
			let expr2 = this.parse_select_expr();
			expr = {
				fn: expr,
				arg: expr2,
			} as ApplyExprN;
		}

		return expr;
	}

	private parse_select_expr(): ExprN {
		let obj = this.parse_term();

		// only set or identifier can use . notation
		if (obj.type != NodeType.Set && obj.type != NodeType.Identifier) {
			return obj;
		}

		// use while to allow chaining
		while (this.at().type == TokenType.Dot) {
			this.eat();  // advance past dot operator
			let member = this.parse_identifier();
			obj = {
				type: NodeType.SelectExpr,
				set: obj,
				member,
			} as SelectExprN;
		}

		return obj
	}

	private parse_term(): ExprN {
		switch (this.at().type) {

			case TokenType.Number:
				return {
					type: NodeType.Number, value: parseFloat(this.eat().value)
				} as NumberN;

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

			// Set
			case TokenType.OpenBrace: {
				let i = this.find(TokenType.CloseBrace);
				if (i > 0) {
					// it is safe to peek at i+1 because the last token is EOF
					if (this.at(i+1).type == TokenType.Colon) {
						return this.parse_params_and_function();
					} else {
						return this.parse_set();
					}
				} else {
					console.error("tokens: ", this.tokens);
					throw "Unexpected EOF while looking for matching '}'";
				}
			}

			// grouping expression
			case TokenType.OpenParen:
				return this.parse_group();

			default:
				console.error("tokens: ", this.tokens);
				throw "Unexpected token found: " + this.at().value;
		}
	}

	private parse_identifier(): IdentifierN {
		let id = this.expect(TokenType.Identifier, "Identifier is missing");
		return { type: NodeType.Identifier, name: id.value };
	}

	private parse_list(): ListN {
			this.eat();  // eat open bracket
			const list: ListN = { type: NodeType.List, elements: [] };
			while (this.until(TokenType.CloseBracket)) {
				list.elements.push(this.parse_term());
			}
			this.expect(TokenType.CloseBracket, "List is not closed");
			return list;
	}

	// { a = 1; b; c = 2; }
	private parse_set(): SetN {
		this.eat();  // eat open brace
		const set: SetN = { type: NodeType.Set, elements: {} };
		while (this.until(TokenType.CloseBrace)) {
			const binding = this.parse_binding(true);
			set.elements[binding.identifier.name] = binding.value;
		}
		this.expect(TokenType.CloseBrace, "Set is not closed");
		return set;
	}

	// { a, b ? 0, c, ... }: expr
	private parse_params_and_function(): ParamsN {
		this.eat();  // eat open brace
		const params: ParamsN = {
			type: NodeType.Params, optional: {}, values: {}, open: false
		};
		while (!this.eof()) {
			if (this.at().type == TokenType.Ellipsis) {
				this.eat();  // eat the ellipsis
				params.open = true;
			} else {
				const name = this.parse_identifier().name;
				if (this.at().type == TokenType.Query) {
					this.eat();  // eat the query
					params.optional[name] = true;
					params.values[name] = this.parse_expr();
				} else {
					params.optional[name] = false;
				}
			}
			if (this.at().type == TokenType.CloseBrace) {
				break;
			}
			this.expect(TokenType.Comma, "Param set must be delimited by ','");
		}
		this.expect(TokenType.CloseBrace, "Param set is not closed");
		return this.parse_function(params);
	}

	private parse_group(): ExprN {
		this.eat();  // eat open parenthesis
		const value = this.parse_expr();
		this.expect(
			TokenType.CloseParen,
			"Parenthetic expression is not closed"
		);
		return value;
	}

	// assumes that param has been parsed already
	private parse_function(param: ExprN): FunctionN {
		this.eat();  // eat colon
		const body = this.parse_expr();
		const f: FunctionN = { type: NodeType.Function, param, body };
		return f;
	}

}
