import Environment from "../environment.ts";

import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
} from "../values.ts";

import { expect_type, show } from "./core.ts";


export function _head(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "head");
	if ((x as ListV).value.length == 0) {
		throw `head cannot be applied on empty list`;
	}
	return (x as ListV).value[0];
}

export function _tail(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "tail");
	x = x as ListV;
	if ((x as ListV).value.length == 0) {
		throw `tail cannot be applied on empty list`;
	}
	return _list((x as ListV).value.slice(1));
}

export function _length(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "length");
	return _integer((x as ListV).value.length);
}

// TODO nix supports partial application of builtin export functions
// e.g. let addOne = x: x + 1; in map addOne

// TODO all pred list
export function _all(x: Value, env: Environment): Value {
	return _boolean();
}

// TODO any pred list
export function _any(x: Value, env: Environment): Value {
	return _boolean();
}

// TODO elem x xs
export function _elem(x: Value, env: Environment): Value {
	return _null();
}

// TODO elemAt xs n
export function _elemAt(x: Value, env: Environment): Value {
	return _null();
}

// TODO groupBy f list
export function _groupBy(x: Value, env: Environment): Value {
	return _null();
}

// TODO filter f list
export function _filter(x: Value, env: Environment): Value {
	return _null();
}

// TODO map f list
export function _map(x: Value, env: Environment): Value {
	return _null();
}

// TODO concat lists
export function _concat(x: Value, env: Environment): Value {
	// TODO
	return _list();
}

// TODO concatMap f list
export function _concatMap(x: Value, env: Environment): Value {
	return _list();
}
