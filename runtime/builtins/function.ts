import Environment from "../environment.ts";

import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
} from "../values.ts";

import { expect_type, show } from "./core.ts";


// TODO functionArgs f
export function _functionArgs(x: Value, env: Environment): Value {
	return _null();
}

