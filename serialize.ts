import { serialize } from "https://deno.land/x/web_bson@v0.2.5/mod.ts";

import Parser from "./frontend/parser.ts";

to_ast("./test/bwa.nix", "./test/bwa.nxt");

async function to_ast(fpath_in: string, fpath_out) {
	const parser = new Parser();
	const src = await Deno.readTextFile(fpath_in);
	const ast = parser.parse(src);
	console.log(ast);
	const ast_serialized = serialize(ast);
	await Deno.writeFile(fpath_out, ast_serialized);
}
