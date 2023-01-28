import Environment from "../environment.ts";

import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
} from "../values.ts";

import { expect_type, show } from "./core.ts";


// attrNames set
export function _attrNames(x: Value, env: Environment): Value {
	expect_type(x, ValueType.Set, "attrNames");
	const names = Object.keys((x as SetV).value);
	return _list( names.map((s) => _string(s)) );
}

// attrValues set
export function _attrValues(x: Value, env: Environment): Value {
	expect_type(x, ValueType.Set, "attrValues");
	return _list( (<any>Object).values((x as SetV).value) );
}

// TODO getAttrs s set
export function _getAttrs(x: Value, env: Environment): Value {
	return _null();
}

// TODO hasAttrs s set
export function _hasAttrs(x: Value, env: Environment): Value {
	return _null();
}

// TODO intersectAttrs e1 e2
export function _intersectAttrs(x: Value, env: Environment): Value {
	return _null();
}

// TODO mapAttrs f set
export function _mapAttrs(x: Value, env: Environment): Value {
	return _null();
}

// TODO catAttrs attr list
// Collect each attribute named attr from a list of attribute sets. Attrsets that don't contain the named attribute are ignored. For example,
// builtins.catAttrs "a" [{a = 1;} {b = 0;} {a = 2;}]
// evaluates to [1 2].
export function _catAttrs(x: Value, env: Environment): Value {
	return _list();
}

