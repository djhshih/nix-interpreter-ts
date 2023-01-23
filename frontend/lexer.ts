export enum TokenType {
	Identifier,
	Number,
	Path,
	UnaryOp,      // !
	BinaryOp,     // ? * / + - < >   
	              // ++ // >= <= == != && ||
	Let,
	In,
	With,
	Rec,
	Equal,
	Comma,
	Dot,
	Colon,
	Semicolon,
	OpenParen,    // (
	CloseParen,   // )
	OpenBracket,  // [
	CloseBracket, // ]
	OpenBrace,    // {
	CloseBrace,   // }
	EOF
}

const keywords: Record<string, TokenType> = {
	let: TokenType.Let,
	in: TokenType.In,
	with: TokenType.With,
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

function is_number(s: string): boolean {
	const c = s.charCodeAt(0);
	const d0 = "0".charCodeAt(0);
	const d9 = "9".charCodeAt(0);
	const dot = ".".charCodeAt(0);
	return (c >= d0 && c <= d9) || c == dot;
}

export function tokenize(s: string): Token[] {
	const tokens = new Array<Token>();
	// FIXME inefficient
	const ss = s.split("");

	while (ss.length > 0) {
		// parse one-character tokens	
		if (ss[0] == "(") {
			tokens.push( token(ss.shift(), TokenType.OpenParen) );
		} else if (ss[0] == ")") {
			tokens.push( token(ss.shift(), TokenType.CloseParen) );
		} else if (ss[0] == "(") {
			tokens.push( token(ss.shift(), TokenType.OpenParen) );
		} else if (ss[0] == "[") {
			tokens.push( token(ss.shift(), TokenType.OpenBracket) );
		} else if (ss[0] == "]") {
			tokens.push( token(ss.shift(), TokenType.CloseBracket) );
		} else if (ss[0] == "{") {
			tokens.push( token(ss.shift(), TokenType.OpenBrace) );
		} else if (ss[0] == "}") {
			tokens.push( token(ss.shift(), TokenType.CloseBrace) );
		} else if (ss[0] == "=") {
			tokens.push( token(ss.shift(), TokenType.Equal) );
		} else if (ss[0] == ";") {
			tokens.push( token(ss.shift(), TokenType.Semicolon) );
		} else if (ss[0] == ":") {
			tokens.push( token(ss.shift(), TokenType.Colon) );
		} else if (ss[0] == ",") {
			tokens.push( token(ss.shift(), TokenType.Comma) );
		} else if (ss[0] == ".") {
			tokens.push( token(ss.shift(), TokenType.Dot) );
		} else if (ss[0] == ".") {
			tokens.push( token(ss.shift(), TokenType.Dot) );
		} else if (
			ss[0] == "?" ||
			ss[0] == "*" ||
			ss[0] == "/" ||
			ss[0] == "+" ||
			ss[0] == "-" ||
			ss[0] == "<" ||
			ss[0] == ">"
		) {
			tokens.push( token(ss.shift(), TokenType.BinaryOp) );
		} else {
			// parse multi-character tokens	

	    // ++ // >= <= == != && ||
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
			if (is_alpha(ss[0])) {
				let name = "";
				while (ss.length > 0 && is_alpha(ss[0])) {
					name += ss.shift();	
				}
				// check for reserved keywords
				const keyword = keywords[name];
				if (typeof keyword == "number") {
					// identifier is a recognized keyword
					tokens.push( token(name, keyword) );
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
	}	

	tokens.push( token("EOF", TokenType.EOF) );

	return tokens;
}

