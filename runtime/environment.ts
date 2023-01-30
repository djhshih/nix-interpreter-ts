import {
	Value, ValueType, Attributes,
	StringV, ListV, FloatV, SetV, DependentV,
	_null, _boolean, _integer, _list, _string, _primfn, _dependent
} from "./values.ts";

import {
	_abort, _throw, _import,
	_isNull, _isBool, _isInt, _isFloat, _isString, _isPath, _isList, _isAttrs, _isFunction,
	_ceil, _floor,
} from "./builtins/core.ts";

import {
	_head, _tail, _length, _all, _any, _elem, _elemAt,
	_groupBy, _filter, _map, _concat, _concatMap,
} from "./builtins/list.ts";

import {
	_attrNames, _attrValues,
} from "./builtins/set.ts";


export default class Environment {
	public parent?: Environment;
	private children: Attributes[];
	public attributes: Attributes;

	constructor(env?: Environment) {
		this.children = [];
		this.attributes = {};

		if (env) {
			this.parent = env;
		} else {
			init_global_env(this);
		}
	}	

	public set(name: string, value: Value): Environment {
		if (this.has(name, true)) {
			throw `attribute ${name} has already been defined in the current environment`;
		}
		this.attributes[name] = value;	
		return this;
	}
	
	// independent: attribute must be independent
	public has(name: string, independent: boolean = false): boolean {
		if (name in this.attributes) {
			return !independent || this.attributes[name].type != ValueType.Dependent;
		}
		return false;
	}

	// get value of attribute in current environment
	public get(name: string): Value {
		return this.attributes[name];
	}

	// get value of attribute in all accessible environments
	public resolve(name: string): Value {
		// current environment has highest priority
		if (name in this.attributes) {
			return this.attributes[name];
		}

		// ascend the parent environment
		let p = this.parent;
		while (p) {
			if (p.has(name)) {
				return p.get(name);
			}
			p = p.parent;
		}

		// `with` expression has lowest priority
	  // among with expressions, latest as highest priority
		for (const child of this.children.slice().reverse()) {
			if (name in child) {
				return child[name];
			}
		}

		return _dependent( [ name ] );
	}

	// first-in last-out
	public attach(attrs: Attributes): Environment {
		this.children.push(attrs);
		return this;
	}

	public dettach(): Attributes | undefined {
		return this.children.pop();
	}
}

function init_global_env(env: Environment) {
	// define global attributes
	env.set("true", _boolean(true));
	env.set("false", _boolean(false));
	env.set("null", _null());

	// define builtin functions
	env.set("abort", _primfn(_abort));
	env.set("throw", _primfn(_throw));
	env.set("import", _primfn(_import));
	env.set("isNull", _primfn(_isNull));
	env.set("isBool", _primfn(_isBool));
	env.set("isInt", _primfn(_isInt));
	env.set("isFloat", _primfn(_isFloat));
	env.set("isString", _primfn(_isString));
	env.set("isPath", _primfn(_isPath));
	env.set("isList", _primfn(_isList));
	env.set("isAttrs", _primfn(_isAttrs));
	env.set("isFunction", _primfn(_isFunction));
	env.set("ceil", _primfn(_ceil));
	env.set("floor", _primfn(_floor));
	env.set("head", _primfn(_head));
	env.set("tail", _primfn(_tail));
	env.set("length", _primfn(_length));
	env.set("attrNames", _primfn(_attrNames));
	env.set("attrValues", _primfn(_attrValues));

	return env;
}

