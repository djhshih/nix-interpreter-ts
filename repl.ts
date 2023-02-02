import Parser from "./frontend/parser.ts";
import Interpreter from "./runtime/interpreter.ts";

repl();

// TODO pretty print values

function repl() {
	const parser = new Parser();
	const interp = new Interpreter();

	console.log("nix");

	while (true) {
		const input = prompt("> ");
		if (!input || input == "exit") {
			Deno.exit(1);
		}

		try {
			// produce ast
			const ast = parser.parse(input);
			console.log("tree: ",  ast);
			// evaluate ast
			const value = interp.evaluate(ast);
			console.log("value: ", value);
		} catch (error) {
			console.error(error);
		}
	}
}
