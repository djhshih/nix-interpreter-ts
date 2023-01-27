import { readLines } from "https://deno.land/std@0.173.0/io/read_lines.ts";

import Parser from "./frontend/parser.ts";
import Interpreter from "./runtime/interpreter.ts";

run_lines("./test/singles.nix");
run_all("./test/multiline.nix");

async function run_lines(fpath: string) {
	const parser = new Parser();
	const interp = new Interpreter();

	const file = await Deno.open(fpath);
	for await (let line of readLines(file)) {
		console.log(line);

		try {
			// produce ast
			const ast = parser.parse(line);
			console.log("tree: ", ast);
			// evaluate ast
			const value = interp.evaluate(ast);
			console.log("value: ", value);
		} catch (error) {
			console.error(error);
		}
		console.log();
	}
}

async function run_all(fpath: string) {
	const parser = new Parser();
	const interp = new Interpreter();

	const src = await Deno.readTextFile(fpath);
	console.log(src);

	const ast = parser.parse(src);
	console.log("true: ", ast);

	const value = interp.evaluate(ast);
	console.log("value: ", value, "\n");
}

