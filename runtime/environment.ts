import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
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
	private parent?: Environment;
	private children: Environment[];
	private attributes: Record<string, Value>;

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
		if (name in this.attributes) {
			throw `attribute ${name} has already been defined in the current environment`;
		}
		this.attributes[name] = value;	
		return this;
	}

	public has(name: string): boolean {
		return name in this.attributes;
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

		// TODO change after implementing `with`
		// `with` should have the lowest priority
		// children environments have lowest priorities
		for (const child of this.children) {
			if (child.has(name)) {
				return child.get(name);
			}
		}

		throw `attribute ${name} is undefined`;
	}

	public attach(env: Environment): Environment {
		this.children.push(env);	
		return this;
	}

	public dettach(): Environment | undefined {
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

