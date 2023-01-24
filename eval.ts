import { readLines } from "https://deno.land/std@0.173.0/io/read_lines.ts";

import Parser from "./frontend/parser.ts";

run_lines("./test/singles.nix");
run_all("./test/multiline.nix");

async function run_lines(fpath: string) {
	const parser = new Parser();

	const file = await Deno.open(fpath);
	for await (let line of readLines(file)) {
		console.log(line);
		const ast = parser.parse(line);
		console.log(ast);
	}
}

async function run_all(fpath: string) {
	const parser = new Parser();
	const src = await Deno.readTextFile(fpath);
	console.log(src);
	const ast = parser.parse(src);
	console.log(ast);
}

