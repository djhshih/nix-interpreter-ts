import { readLines } from "https://deno.land/std@0.173.0/io/read_lines.ts";

import Parser from "./frontend/parser.ts";

run("./test/singles.nix");

async function run(fpath: string) {
	const parser = new Parser();

	const file = await Deno.open(fpath);
	for await (let line of readLines(file)) {
		console.log(line);
		const ast = parser.parse(line);
		console.log(ast);
	}
}

