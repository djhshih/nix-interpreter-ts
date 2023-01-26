import Environment from "../environment.ts";

import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
} from "../values.ts";


export function expect_type(x: Value, t: ValueType, context: string) {
	if (x.type != t) {
		throw `${context} expects a ${t} but got ${x.type}`;
	}
}

export function show(x: Value) {
	if (x.type == ValueType.String) {
		return (x as StringV).value;
	} else {
		return x.toString();
	}
}

export function _abort(x: Value, env: Environment): Value {
	throw `abort: ${show(x)}`;
}

export function _throw(x: Value, env: Environment): Value {
	throw `throw: ${show(x)}`;
}

export function _import(x: Value, env: Environment): Value {
	if (x.type != ValueType.Path && x.type != ValueType.String) {
		throw `import expects a path but got ${x.type}`;
	}

	// TODO read file at path x and parse into expresssion
	// TODO import expression into env
	throw `import is not implemented yet`;

	return _null();
}


export function _isNull(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Null);
}

export function _isBool(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Boolean);
}

export function _isInt(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Integer);
}

export function _isFloat(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Float);
}

export function _isString(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.String);
}

export function _isPath(x: Value, env: Environment): Value  {
	return _boolean(x.type == ValueType.Path);
}

export function _isList(x: Value, env: Environment): Value  {
	return _boolean(x.type == ValueType.List);
}

export function _isAttrs(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Set);
}

export function _isFunction(x: Value, env: Environment): Value {
	return _boolean(
		x.type == ValueType.Function ||
		x.type == ValueType.PFunction
	);
}


export function _ceil(x: Value, env: Environment): Value {
	return _integer(Math.ceil((x as FloatV).value));
}

export function _floor(x: Value, env: Environment): Value {
	return _integer(Math.floor((x as FloatV).value));
}

// TODO bitAnd
// TODO bitOr
// TODO bitXor

