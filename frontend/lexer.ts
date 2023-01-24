export enum TokenType {
	Identifier = "id",
	Number = "num",
	Path = "path",
	UnaryOp = "op1",      // - !
	BinaryOp = "op2",     // ? ++ * / + - < > // >= <= == != && ||
	Let = "let",
	In = "in",
	With = "with",
	If = "if",
	Then = "then",
	Else = "else",
	Rec = "rec",
	Equal = "=",
	Comma = ",",
	Dot = ".",
	Colon = ":",
	Semicolon = ";",
	Query = "?",
	Quote1 = "'",
	Quote2 = "\"",
	OpenParen = "(",
	CloseParen = ")",
	OpenBracket = "[",
	CloseBracket = "]",
	OpenBrace = "{",
	CloseBrace = "}",
	EOF = "eof"
}

const keywords: Record<string, TokenType> = {
	let: TokenType.Let,
	in: TokenType.In,
	with: TokenType.With,
	if: TokenType.If,
	then: TokenType.Then,
	else: TokenType.Else,
	rec: TokenType.Rec,
}

export interface Token {
	value: string;
	type: TokenType;
}

// Returns a token of a given type and value
function token(value = "", type: TokenType): Token {
	return { value, type };
}

function is_alpha(s: string): boolean {
	return s.toUpperCase() != s.toLowerCase();
}

function is_whitespace(s: string): boolean {
	return s == " " || s == "\t" || s == "\n" || s == "\r";
}

function is_identifier(s: string): boolean {
	return is_alpha(s) || is_digit(s) || s == "_" || s == "-";
}

function is_digit(s: string): boolean {
	const c = s.charCodeAt(0);
	const d0 = "0".charCodeAt(0);
	const d9 = "9".charCodeAt(0);
	return c >= d0 && c <= d9;
}

// FIXME this would allow multiple '.'
function is_number(s: string): boolean {
	return is_digit(s) || s == ".";
}

export function tokenize(s: string): Token[] {
	const tokens = new Array<Token>();
	// FIXME inefficient
	const ss = s.split("");

	while (ss.length > 0) {

		// parse multi-character tokens
		// NB this needs to be handled first because tokens below
		//    can be a prefix of a token here
		// ++ // >= <= == != && ||
		if (ss.length >= 2) {
			const ss2 = ss[0] + ss[1];
			if (
				ss2 == "++" ||
				ss2 == "//" ||
				ss2 == ">=" ||
				ss2 == "<=" ||
				ss2 == "==" ||
				ss2 == "!=" ||
				ss2 == "&&" ||
				ss2 == "||"
			) {
				ss.shift(); ss.shift();
				tokens.push( token(ss2, TokenType.BinaryOp) );
				continue;
			}
		}

		// parse one-character tokens	
		if (ss[0] == "(") {
			tokens.push( token(ss.shift(), TokenType.OpenParen) );
			continue;
		}
		
		if (ss[0] == ")") {
			tokens.push( token(ss.shift(), TokenType.CloseParen) );
			continue;
		}
		
		if (ss[0] == "(") {
			tokens.push( token(ss.shift(), TokenType.OpenParen) );
			continue;
		}
		
		if (ss[0] == "[") {
			tokens.push( token(ss.shift(), TokenType.OpenBracket) );
			continue;
		}
		
		if (ss[0] == "]") {
			tokens.push( token(ss.shift(), TokenType.CloseBracket) );
			continue;
		}
		
		if (ss[0] == "{") {
			tokens.push( token(ss.shift(), TokenType.OpenBrace) );
			continue;
		}
		
		if (ss[0] == "}") {
			tokens.push( token(ss.shift(), TokenType.CloseBrace) );
			continue;
		} 
		
		if (ss[0] == "=") {
			tokens.push( token(ss.shift(), TokenType.Equal) );
			continue;
		}

		if (ss[0] == ";") {
			tokens.push( token(ss.shift(), TokenType.Semicolon) );
			continue;
		}
		
		if (ss[0] == ":") {
			tokens.push( token(ss.shift(), TokenType.Colon) );
			continue;
		}
		
		if (ss[0] == ",") {
			tokens.push( token(ss.shift(), TokenType.Comma) );
			continue;
		}
		
		if (ss[0] == ".") {
			tokens.push( token(ss.shift(), TokenType.Dot) );
			continue;
		}

		if (ss[0] == "?") {
			tokens.push( token(ss.shift(), TokenType.Query) );
			continue;
		}

		if (
			ss[0] == "?" ||
			ss[0] == "*" ||
			ss[0] == "/" ||
			ss[0] == "+" ||
			ss[0] == "-" ||
			ss[0] == "<" ||
			ss[0] == ">"
		) {
			tokens.push( token(ss.shift(), TokenType.BinaryOp) );
			continue;
		}

		// numeric literals
		if (is_number(ss[0])) {
			let num = "";
			while (ss.length > 0 && is_number(ss[0])) {
				num += ss.shift();
			}	
			tokens.push( token(num, TokenType.Number) );
			continue;
		}

		// identifiers
		// first character must be an alphabet
		if (is_alpha(ss[0])) {
			let name = "";
			while (ss.length > 0 && is_identifier(ss[0])) {
				name += ss.shift();	
			}
			// check for reserved keywords
			if (name in keywords) {
				// identifier is a recognized keyword
				tokens.push( token(name, keywords[name]) );
			} else {
				tokens.push( token(name, TokenType.Identifier) );
			}
			continue;
		}

		// whitespace
		if (is_whitespace(ss[0])) {
			ss.shift();
			continue;
		}

		// unrecognized character
		throw "Unrecognized character found in source: " + ss[0]
	}	

	tokens.push( token("EOF", TokenType.EOF) );

	return tokens;
}

