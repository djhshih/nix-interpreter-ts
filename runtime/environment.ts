import {
	Value, ValueType,
	StringV, ListV, FloatV, SetV,
	_null, _boolean, _integer, _list, _string, _primfn
} from "./values.ts";

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

function expect_type(x: Value, t: ValueType, context: string) {
	if (x.type != t) {
		throw `${context} expects a ${t} but got ${x.type}`;
	}
}

function show(x: Value) {
	if (x.type == ValueType.String) {
		return (x as StringV).value;
	} else {
		return x.toString();
	}
}

function _abort(x: Value, env: Environment): Value {
	throw `abort: ${show(x)}`;
}

function _throw(x: Value, env: Environment): Value {
	throw `throw: ${show(x)}`;
}

function _import(x: Value, env: Environment): Value {
	if (x.type != ValueType.Path && x.type != ValueType.String) {
		throw `import expects a path but got ${x.type}`;
	}

	// TODO read file at path x and parse into expresssion
	// TODO import expression into env
	throw `import is not implemented yet`;

	return _null();
}


function _isNull(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Null);
}

function _isBool(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Boolean);
}

function _isInt(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Integer);
}

function _isFloat(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Float);
}

function _isString(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.String);
}

function _isPath(x: Value, env: Environment): Value  {
	return _boolean(x.type == ValueType.Path);
}

function _isList(x: Value, env: Environment): Value  {
	return _boolean(x.type == ValueType.List);
}

function _isAttrs(x: Value, env: Environment): Value {
	return _boolean(x.type == ValueType.Set);
}

function _isFunction(x: Value, env: Environment): Value {
	return _boolean(
		x.type == ValueType.Function ||
		x.type == ValueType.PFunction
	);
}


function _ceil(x: Value, env: Environment): Value {
	return _integer(Math.ceil((x as FloatV).value));
}

function _floor(x: Value, env: Environment): Value {
	return _integer(Math.floor((x as FloatV).value));
}

// bitAnd
// bitOr
// bitXor


function _head(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "head");
	if ((x as ListV).value.length == 0) {
		throw `head cannot be applied on empty list`;
	}
	return (x as ListV).value[0];
}

function _tail(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "tail");
	x = x as ListV;
	if ((x as ListV).value.length == 0) {
		throw `tail cannot be applied on empty list`;
	}
	return _list((x as ListV).value.slice(1));
}

function _length(x: Value, env: Environment): Value {
	expect_type(x, ValueType.List, "length");
	return _integer((x as ListV).value.length);
}

// TODO nix supports partial application of builtin functions
// e.g. let addOne = x: x + 1; in map addOne

// all pred list
function _all(x: Value, env: Environment): Value {
	// TODO
	return _boolean();
}

// any pred list
function _any(x: Value, env: Environment): Value {
	// TODO
	return _boolean();
}

// elem x xs
function _elem(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// elemAt xs n
function _elemAt(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// groupBy f list
function _groupBy(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// filter f list
function _filter(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// map f list
function _map(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// concat lists
function _concat(x: Value, env: Environment): Value {
	// TODO
	return _list();
}

// concatMap f list
function _concatMap(x: Value, env: Environment): Value {
	// TODO
	return _list();
}


// attrNames set
function _attrNames(x: Value, env: Environment): Value {
	expect_type(x, ValueType.Set, "attrNames");
	const names = Object.keys((x as SetV).value);
	return _list( names.map((s) => _string(s)) );
}

// attrValues set
function _attrValues(x: Value, env: Environment): Value {
	expect_type(x, ValueType.Set, "attrValues");
	return _list( (<any>Object).values((x as SetV).value) );
}

// getAttrs s set
function _getAttrs(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// hasAttrs s set
function _hasAttrs(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// intersectAttrs e1 e2
function _intersectAttrs(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// mapAttrs f set
function _mapAttrs(x: Value, env: Environment): Value {
	// TODO
	return _null();
}

// catAttrs attr list
// Collect each attribute named attr from a list of attribute sets. Attrsets that don't contain the named attribute are ignored. For example,
// builtins.catAttrs "a" [{a = 1;} {b = 0;} {a = 2;}]
// evaluates to [1 2].
function _catAttrs(x: Value, env: Environment): Value {
	// TODO
	return _list();
}

