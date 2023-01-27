export enum TokenType {
	Identifier = "id",
	Number = "num",
	String = "str",
	Path = "path",        // TODO
	UnaryOp = "op1",      // ! - (lexer will label all '-' as binary)
	BinaryOp = "op2",     // ? ++ * / + - // < > >= <= == != && || ->
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
	Ellipsis = "...",
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
	// FIXME inefficient split
	let ss = s.split("");

	// FIXME avoid use of shift, which has O(n) complexity

	while (ss.length > 0) {

		// single line comments
		if (ss[0] == "#") {
			// ignore everything after '#' until a new tline
			console.log("length: ", ss.length)
			if (ss.length > 1) {
				let end = -1;
				for (let i = 2; i < ss.length; i++) {
					if (ss[i] == "\n") {
						end = i;
						break;
					}
				}
				// ignore comment
				console.log(end);
				if (end > 0 && end < ss.length) {
					ss = ss.slice(end + 1);
				} else {
					ss = [];
				}
			} else {
				ss = [];
			}
			continue;
			console.log(ss);
		}
		
		// multiline comments
		if (ss[0] == "/" && ss[1] == "*") {
			if (ss.length > 2) {
				let end = -1;
				for (let i = 2; i < ss.length; i++) {
					if (ss[i-1] == "*" && ss[i] == "/") {
						end = i;
						break;
					}
				}
				// ignore comment
				// remove consumed characters, including matching quotes */
				ss = ss.slice(end + 1);
			} else {
				throw "Comment token /* is an unmatched";
			}
			continue;
			console.log(ss);
		}


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
				ss2 == "||" ||
				ss2 == "->"
			) {
				ss.shift(); ss.shift();
				tokens.push( token(ss2, TokenType.BinaryOp) );
				continue;
			}

			if ( ss2 == "''" ) {
				if (ss.length > 2) {
					let end = -1;
					for (let i = 2; i < ss.length; i++) {
						if (ss[i] == "'" && ss[i-1] == "'") {
							end = i-1;
							break;
						}
					}
					// construct string, ignore first and last character
					if (end < 0) {
						throw "Unexpected EOF when searching for matching ''";
					} else if (end > 2) {
						// strip leading whitespace for first line and
						// before each line but preserving the lines
						let str = ss.slice(2, end).join("")
							.replace(/^\s+/, "").replace(/\n\s+/g, "\n");
						tokens.push( token(str, TokenType.String) );
					} else {
						tokens.push( token("", TokenType.String) );
					}
					// remove consumed characters, including matching quotes ''
					ss = ss.slice(end + 2);
				} else {
					throw "Last characters are an unmatched ''";
				}
				continue;
			}
		}

		if (ss[0] == "\"") {
			if (ss.length > 1) {
				let end = -1;
				for (let i = 1; i < ss.length; i++) {
					if (ss[i] == "\"" && ss[i-1] != "\\") {
						end = i;
						break;
					}
				}
				// construct string, ignore first and last character
				if (end < 0) {
					throw "Unexpected EOF when searching for matching \"";
				} else if (end > 1) {
					let str = ss.slice(1, end).join("");
					tokens.push( token(str, TokenType.String) );
				} else {
					tokens.push( token("", TokenType.String) );
				}
				// remove consumed characters, including matching quotes "
				ss = ss.slice(end + 1);
			} else {
				throw "Last character is an unmatched \"";
			}
			continue;
		}

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

		if (ss.length >= 3) {
			const ss3 = ss[0] + ss[1] + ss[2];
			if (ss3 == "...") {
				ss.shift(); ss.shift(); ss.shift();
				tokens.push( token(ss3, TokenType.Ellipsis) );
				continue;
			}
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

		if (
			ss[0] == "!"
		) {
			tokens.push( token(ss.shift(), TokenType.UnaryOp) );
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

