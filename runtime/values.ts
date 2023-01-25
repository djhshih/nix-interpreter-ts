import Environment from "./environment.ts";
import { FunctionN } from "../frontend/ast.ts";

export enum ValueType {
	Null = "null",
	Number = "num",
	Boolean = "bool",
	String = "str",
	List = "list",
	Set = "set",
	Function = "fn",
}

export interface Value {
	type: ValueType;
}

export interface NullV extends Value {
	type: ValueType;
	value: null;
}

export interface NumberV extends Value {
	type: ValueType;
	value: number;
}

export interface BooleanV extends Value {
	type: ValueType;
	value: boolean;
}

export interface StringV extends Value {
	type: ValueType;
	value: string;
}

export interface ListV extends Value {
	type: ValueType;
	value: Value[];
}

export interface SetV extends Value {
	type: ValueType;
	value: Record<string, Value>;
}

export interface FunctionV extends Value {
	type: ValueType;
	env: Environment;
	node: FunctionN;
}

export function new_null() {
	return { type: ValueType.Null, value: null } as NullV;
}

export function new_number(v = 0): NumberV {
	return { type: ValueType.Number, value: v };
}

export function new_boolean(v = false): BooleanV {
	return { type: ValueType.Boolean, value: v };
}

export function new_string(v = ""): StringV {
	return { type: ValueType.String, value: v };
}

export function new_list(v = []): ListV {
	return { type: ValueType.List, value: v };
}

export function new_set(v = {}): SetV {
	return { type: ValueType.Set, value: v };
}

export function new_function(env, fn): FunctionV {
	return { type: ValueType.Function, env: env, node: fn };
}

