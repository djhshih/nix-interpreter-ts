import Parser from "./frontend/parser.ts";

repl();

function repl() {
	console.log("nix");

	while (true) {
		const input = prompt("> ");
		if (!input || input == "exit") {
			Deno.exit(1);
		}

		const parser = new Parser();
		// produce ast
		const ast = parser.parse(input);
		console.log(ast);
	}
}
