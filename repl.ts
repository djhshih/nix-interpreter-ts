import { tokenize } from "./frontend/lexer.ts";

repl();

function repl() {
	console.log("nix");

	while (true) {
		const input = prompt("> ");
		if (!input || input == "exit") {
			Deno.exit(1);
		}

		// produce tokens
		const tokens = tokenize(input);
		console.log(tokens);
	}
}
