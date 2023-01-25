import { existsSync } from "https://deno.land/std/fs/mod.ts";

import Environment from "./environment.ts";
import { Value } from "./values.ts";

// baseNameOf s
function _baseNameOf(x: Value, env: Environment): Value {
	// TODO
	return new_string();
}

// dirOf s
function _dirOf(x: Value, env: Environment): Value {
	// TODO
	return new_string();
}

// getEnv s
function _getEnv(x: Value, env: Environment): Value {
	return Deno.env.get(x.value);
}

// pathExists path
function _pathExists(x: Value, env: Environment): Value {
	const found = existsSync(x.value);
	return new_bool(found);
}

