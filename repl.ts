import Parser from "./frontend/parser.ts";
import Interpreter from "./runtime/interpreter.ts";

repl();

function repl() {
	const parser = new Parser();
	const interp = new Interpreter();

	console.log("nix");

	while (true) {
		const input = prompt("> ");
		if (!input || input == "exit") {
			Deno.exit(1);
		}

		// produce ast
		try {
			const ast = parser.parse(input);
			console.log("AST: ",  ast);

			const value = interp.evaluate(ast);
			console.log("value: ", value);
		} catch (error) {
			console.error(error);
		}
	}
}
