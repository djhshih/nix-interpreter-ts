import { existsSync } from "https://deno.land/std/fs/mod.ts";

import type Environment from "../environment.ts";
import {
 	Value,
	_boolean, _string,
} from "../values.ts";

// baseNameOf s
export function _baseNameOf(x: Value, env: Environment): Value {
	// TODO
	return _string();
}

// dirOf s
export function _dirOf(x: Value, env: Environment): Value {
	// TODO
	return _string();
}

// getEnv s
export function _getEnv(x: Value, env: Environment): Value {
	return Deno.env.get(x.value);
}

// pathExists path
export function _pathExists(x: Value, env: Environment): Value {
	const found = existsSync(x.value);
	return _boolean(found);
}

