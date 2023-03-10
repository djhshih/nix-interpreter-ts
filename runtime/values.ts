import Environment from "./environment.ts";
import { FunctionN } from "../frontend/ast.ts";

export enum ValueType {
	Null = "null",
	Dependent = "dep",
	Integer = "int",
	Float  = "float",
	Boolean = "bool",
	String = "str",
	Path = "path",
	List = "list",
	Set = "set",        // set of attributes
	Function = "fn",    // user-defined function
	PFunction = "pfn",  // primitive function
}

export type Attributes = Record<string, Value>;

export interface Value {
	type: ValueType;
}

export interface NullV extends Value {
	type: ValueType.Null;
	value: null;
}

// Stores all dependent attributes.
// Operations on DependentV return another DependentV.
export interface DependentV extends Value {
	type: ValueType.Dependent;
	// native Set type to hold attribute names
	depends: Set<string>;
}

export interface IntegerV extends Value {
	type: ValueType.Integer;
	value: number;
}

export interface FloatV extends Value {
	type: ValueType.Float;
	value: number;
}

export interface BooleanV extends Value {
	type: ValueType.Boolean;
	value: boolean;
}

export interface StringV extends Value {
	type: ValueType.String;
	value: string;
}

export interface PathV extends Value {
	type: ValueType.Path;
	value: string;
}

export interface ListV extends Value {
	type: ValueType.List;
	value: Value[];
}

export interface SetV extends Value {
	type: ValueType.Set;
	value: Attributes;
}

export interface FunctionV extends Value {
	type: ValueType.Function;
	env: Environment;
	node: FunctionN;
}

export interface PFunctionV extends Value {
	type: ValueType.PFunction;
	obj: FunctionObject;
}

export type FunctionObject = (arg: Value, env: Environment) => Value;


export function _null(): NullV {
	return { type: ValueType.Null, value: null } as NullV;
}

export function _dependent(v: any = []): DependentV {
	return { type: ValueType.Dependent, depends: new Set<string>(v) };
}

export function _integer(v = 0): IntegerV {
	// truncate towards 0
	return { type: ValueType.Integer, value: Math.trunc(v) };
}

export function _float(v = 0): FloatV {
	return { type: ValueType.Float, value: v };
}

export function _boolean(v = false): BooleanV {
	return { type: ValueType.Boolean, value: v };
}

export function _string(v = ""): StringV {
	return { type: ValueType.String, value: v };
}

export function _list(v: Value[] = []): ListV {
	return { type: ValueType.List, value: v };
}

export function _set(v: Attributes = {}): SetV {
	return { type: ValueType.Set, value: v };
}

export function _function(env: Environment, fn: FunctionN): FunctionV {
	return { type: ValueType.Function, env: env, node: fn };
}

export function _primfn(obj: FunctionObject): PFunctionV {
	return { type: ValueType.PFunction, obj: obj };	
}

