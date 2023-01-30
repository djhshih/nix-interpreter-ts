import {
	NodeType,
	ExprN,
	BindingN,
	FunctionN,
	LetExprN,
	WithExprN,
	IfExprN,
	SelectExprN,
	ApplyExprN,
	ParamsN,
	UnaryExprN,
	BinaryExprN,
	ListN,
	SetN,
	StringN,
	NumberN,
	IdentifierN,
} from "../frontend/ast.ts";

import {
	ValueType, Value, Attributes,
	FloatV, IntegerV, BooleanV, SetV, PFunctionV, FunctionV, StringV, PathV,
	DependentV, ListV,
	_null, _float, _integer, _boolean, _string, _set, _list, _function,
	_dependent,
} from "./values.ts";

import Environment from "./environment.ts";

import Graph from "./graph.ts";

// TODO handle dependent value type all expressions

export default class Interpreter {
	private env: Environment;

	constructor() {
		this.env = new Environment();
	}

	public evaluate(expr: ExprN): Value {
		return evaluate(expr, this.env);
	}
}

function evaluate(expr: ExprN, env: Environment): Value {
	switch (expr.type) {
		case NodeType.Identifier:
			return eval_identifier(expr as IdentifierN, env);

		case NodeType.Number: {
			if ((expr as NumberN).integer) {
				return _integer((expr as NumberN).value);
			} else {
				return _float((expr as NumberN).value);
			}
		}

		case NodeType.String:
			return _string((expr as StringN).value);

		case NodeType.UnaryExpr: {
			const uexpr = (expr as UnaryExprN);
			const op = uexpr.op;
			const right = evaluate(uexpr.right, env);
			switch (op) {
				case "-": {
					if (right.type == ValueType.Integer) {
						return _integer(- (right as IntegerV).value);
					} else if	(right.type == ValueType.Float) {
						return _float(- (right as FloatV).value);
					}
					throw `Unary operator ${op} can be only be applied on a number but got ${right.type}`
				}
				case "!": {
					if (right.type == ValueType.Boolean) {
						return _boolean(! (right as BooleanV).value);
					}
					throw `Unary operator ${op} can be only be applied on a boolean but got ${right.type}`
				}
				default:
					throw `Unsupported unary operator ${op}` 
			}
		}

		case NodeType.BinaryExpr:
			return eval_binary_expr((expr as BinaryExprN), env);

		case NodeType.IfExpr: {
			const ifexpr = (expr as IfExprN);
			const condition = evaluate(ifexpr.condition, env);
			if (condition.type != ValueType.Boolean) {
				throw `Expecting if condition to be a boolean but got ${condition.type}`;
			}
			if ((condition as BooleanV).value) {
				return evaluate(ifexpr.left, env);
			} else {
				return evaluate(ifexpr.right, env);
			}
		}

		case NodeType.List: {
			let xs = (expr as ListN).elements;
			let list = _list();
			list.value = xs.map((x) => evaluate(x, env));
			return list;
		}

		case NodeType.Set: {
			let setn =(expr as SetN);
			if (setn.rec) {
				// self-reference (rec) set
				let env2 = new Environment(env);
				let record = setn.elements;
				let set = _set();
				let graph = new Graph<string>();
				// when an attr x is defined in env and re-defined in
				// the set, we will not shadow x as intended
				// so, we need to do a first pass through record to
				// define all attribute as dependent
				for (const dest in record) {
					env2.set(dest, _dependent([dest]));
				}
				// define attributes
				for (const dest in record) {
					let value = evaluate(record[dest], env2);
					if (value.type != ValueType.Dependent) {
						set.value[dest] = value;
						env2.set(dest, value);
						graph.add_indep_node(dest);
					} else {
						// value depends an attribute that that is yet to be defined
						// add to dependency graph
						graph.add_in_edges(dest, (value as DependentV).depends);
					}
				}
				// resolve dependencies
				if (graph.size() > 0) {
					// at least one attr remains a dependent value
					// generate dependent attrs in topological order
					let dep_sorted = graph.sort();	
					// now, we can just evaluate the attributes in order
					for (const dest of dep_sorted) {
						if (set.value[dest]) continue;
						let value = evaluate(record[dest], env2);
						set.value[dest] = value;
						env2.set(dest, value);
					}
				}

				return set;
			}

			// non-self-referencing set
			let record = setn.elements;
			let set = _set();
			for (const name in record) {
				// set is independent of env => self-referencing is disallowed in set
				set.value[name] = evaluate(record[name], env);
			}
			return set;
		}

		case NodeType.LetExpr: {
			const letexpr = (expr as LetExprN);
			let env2 = new Environment(env);
			for (const binding of letexpr.bindings) {
				eval_binding(binding, env2);
			}
			return evaluate(letexpr.body, env2);
		}

		case NodeType.SelectExpr: {
			const selexpr = (expr as SelectExprN);
			let set =
				selexpr.set.type == NodeType.Identifier
				? eval_identifier(selexpr.set as IdentifierN, env)
				: evaluate(selexpr.set, env);
			if (set.type != ValueType.Set) {
				throw `Invalid select expression; expecting set but got ${set.type}`;
			}
			let setv = (set as SetV).value;
			if (! (selexpr.member.name in setv)) {
				throw `Invalid key: Set ${set} does not contain key ${selexpr.member.name}`;
			}
			return setv[selexpr.member.name];
		}

		case NodeType.WithExpr: {
			const withexpr = (expr as WithExprN);
			const set = evaluate(withexpr.env, env);
			if (set.type != ValueType.Set) {
				throw `Invalid with expression; expecting set but got ${set.type}`;
			}
			let setv = (set as SetV).value;
			env.attach(setv);
			let res = evaluate(withexpr.body, env);
			env.dettach();
			return res;
		}

		case NodeType.ApplyExpr: {
			return eval_apply_expr(expr as ApplyExprN, env);
			throw `Interpretation of AST node type has yet to be implemented: ${expr.type}`
		}

		case NodeType.Function: {
			return _function(env, expr as FunctionN);
		}

		default:
			throw `Interpretation of AST node type ${expr.type} is not supported`
	}
}

function eval_identifier(id: IdentifierN, env: Environment): Value {
	return env.resolve(id.name);
}

// TODO implement self-reference in binding expression
function eval_binding(binding: BindingN, env: Environment): Environment {
	if (env.parent) {
		// evaluate binding value in the parent environment
		// this is to ensure that order of evaluation does not matter
		// define the attribute in the specified environment
		env.set(binding.identifier.name, evaluate(binding.value, env.parent));
		return env;
	}
	throw `Evaluation is not permitted in the global environment`;
}

function eval_apply_expr(apply: ApplyExprN, env: Environment): Value {
	let fn = evaluate(apply.fn, env);
	// evaluate the argument in the current environment
	let arg = evaluate(apply.arg, env);
	switch (fn.type) {
		case ValueType.Function: {
			const fnv = (fn as FunctionV);
			// private environment for the function using the enclosed
			// environment as the parent
			// we don't use the enclosed directly because we do not
			// want to modify this environment (where fn was defined)
			const env2 = new Environment(fnv.env);
			const fnn = fnv.node;

			switch (fnn.param.type) {
				case NodeType.Identifier: {
					env2.set((fnn.param as IdentifierN).name, arg);
					return evaluate(fnn.body, env2);
				}

				case NodeType.Params: {
					if (arg.type != ValueType.Set) {
						throw `Function expects a set but got ${arg.type}`;
					}
					const args = (arg as SetV).value;
					const params = (fnn.param as ParamsN);
					// assign values to each parameter in the private environment
					// Object.keys( params.optional ) contain all the parameter names
					for (const name in params.optional) {
						if (name in args) {
							// define the parameter using the argument
							env2.set(name, args[name]);
						} else if (name in params.defaults) {
							// define the parameter using the default expression evaluated
							// in the enclosed environment
							env2.set(name, evaluate(params.defaults[name], fnv.env));
						} else {
							throw `Function expects ${name} but it is missing`
						}
					}
					// evaluate the result in the private environment
					return evaluate(fnn.body, env2);
				}
					
				default:
					throw `Function unexpectedly have parameter node type ${fnn.param.type}`;
			}
			// evaluate the function body in the enclosed environment
			throw `Application of user-defined function is not supported`
			break;
		}

		case ValueType.PFunction: {
			// primitive function can be called directly
			return (fn as PFunctionV).obj(arg, env);
			break;
		}

		case ValueType.Dependent:
			return fn;

		default:
			throw `Expecting to apply function but got ${fn.type}`;
	}
}

function merge_dependents(left: DependentV, right: DependentV) {
		let depv = _dependent( left.depends );
		for (const d of right.depends) {
			depv.depends.add(d);
		}
		return depv;
}

function eval_binary_expr(op2: BinaryExprN, env: Environment): Value {
	const left = evaluate(op2.left, env);
	const op = op2.op;

	if (left.type == ValueType.Dependent) {
		const right = evaluate(op2.right, env);
		if (right.type == ValueType.Dependent) {
			return merge_dependents(left as DependentV, right as DependentV);
		}
		return left;
	}

	// logical operations
	switch (op) {
		case "&&":
		case "||":
		case "->": {
			if (left.type == ValueType.Boolean) {
				let leftv = (left as BooleanV).value;
				// check for possible early evaluation using only left operand value
				if (leftv) {
					if (op == "||" && leftv) return _boolean(true);
				} else {
					if (op == "&&") return _boolean(false);
					if (op == "->") return _boolean(true);
				}
				// at this point, we need the right operand for the result
				const right = evaluate(op2.right, env);
				if (right.type == ValueType.Boolean) {
					return _boolean(op_logical(
						op, leftv, (right as BooleanV).value
					));
				} else {
					throw `Expecting right operand to be a boolean for operator ${op} but got ${right.type}`;
				}
			} else {
				throw `Expecting left operand to be a boolean for operator ${op} but got ${left.type}`;
			}
		}
	}

	// equality operations
	if (op == "==") {
		const right = evaluate(op2.right, env);
		return _boolean( op_equality(left, right) );
	}

	// inequality operations
	if (op == "!=") {
		const right = evaluate(op2.right, env);
		return _boolean( ! op_equality(left, right) );
	}

	// string and path concatenations
	if (op == "+") {
	 	if (left.type == ValueType.String) {
			const right = evaluate(op2.right, env);
			if (right.type == ValueType.String) {
				return _string((left as StringV).value + (right as StringV).value);
			} else if (right.type == ValueType.Path) {
				return _string((left as StringV).value + (right as PathV).value);
			} else {
				throw `Path can only be concatenation with another path or string but got ${right.type}`
			}
		} else if (left.type == ValueType.Path) {
			const right = evaluate(op2.right, env);
			if (right.type == ValueType.Path) {
				return _string((left as PathV).value + (right as PathV).value);
			} else if (right.type == ValueType.String) {
				return _string((left as PathV).value + (right as StringV).value);
			} else {
				throw `Path can only be concatenation with another path or string but got ${right.type}`
			}
		}
	}

	// arithmetic and comparison operations
	switch (op) {
		case "+":
		case "-":
		case "*":
		case "/": {
			const right = evaluate(op2.right, env);
			if (left.type == ValueType.Float) {
				const leftv = (left as FloatV).value;
				if (right.type == ValueType.Float) {
					const rightv = (right as FloatV).value;
					return _float(op_arithmetic(op, leftv, rightv));
				} else if (right.type == ValueType.Integer) {
					const rightv = (right as IntegerV).value;
					return _float(op_arithmetic(op, leftv, rightv));
				}
			} else if (left.type == ValueType.Integer) {
				const leftv = (left as IntegerV).value;
				if (right.type == ValueType.Float) {
					const rightv = (right as FloatV).value;
					return _float(op_arithmetic(op, leftv, rightv));
				} else if (right.type == ValueType.Integer) {
					const rightv = (right as IntegerV).value;
					return _integer(op_arithmetic(op, leftv, rightv));
				}
			}
			break;
		}
		case "<":
		case ">":
		case "<=":
		case ">=": {
			const right = evaluate(op2.right, env);
			let leftv: number;
			let rightv: number;
			if (left.type == ValueType.Float) {
				leftv = (left as FloatV).value;
			} else if (left.type == ValueType.Integer) {
				leftv = (left as IntegerV).value;
			} else {
				throw `Expecting left operand to be a number for operator ${op} but got ${left.type}`;
			}
			if (right.type == ValueType.Float) {
				rightv = (right as FloatV).value;
			} else if (right.type == ValueType.Integer) {
				rightv = (right as IntegerV).value;
			} else {
				throw `Expecting right operand to be a number for operator ${op} but got ${right.type}`;
			}
			return _boolean(op_comparative(op, leftv, rightv));
		}
	}
	
	// concatentation operation
	if (op == "++") {
		if (left.type == ValueType.List) {
			const right = evaluate(op2.right, env);
			if (right.type == ValueType.List) {
				return _list( 
					(left as ListV).value.concat( (right as ListV).value )
				);
			} else if (right.type == ValueType.Dependent) {
				return right;
			} else {
				throw `Expecting right operand to be a list for operator ${op} but got ${left.type}`;
			}
		} else if (left.type == ValueType.Dependent) {
			const right = evaluate(op2.right, env);
			if (right.type == ValueType.Dependent) {
				return merge_dependents(left as DependentV, right as DependentV);	
			}
			return left;	
		} else {
			throw `Expecting left operand to be a list for operator ${op} but got ${left.type}`;
		}
	}

	// update operation
	// in "a // b", overwrite attributes in a with attributes in b
	if (op == "//") {
		if (left.type == ValueType.Set) {
			let leftv = (left as SetV).value;
			const right = evaluate(op2.right, env);
			if (right.type == ValueType.Set) {
				let rightv = (right as SetV).value;
				// update or add attributes in left using right
				let res: Attributes = {};
				for (const key in leftv) {
					res[key] = leftv[key];
				}
				for (const key in rightv) {
					res[key] = rightv[key];
				}
				return _set(res);
			} else {
				throw `Expecting right operand to be a set for operator ${op} but got ${left.type}`;
			}
		} else {
			throw `Expecting left operand to be a set for operator ${op} but got ${left.type}`;
		}
	}

	// set ? key
	if (op == "?") {
		if (left.type == ValueType.Set) {
			let key;
			if (op2.right.type == NodeType.Identifier) {
				key = (op2.right as IdentifierN).name;
			} else if (op2.right.type == NodeType.String) {
				key = (op2.right as StringN).value;
			} else {
				throw `Expecting right node to be an identifier or string for operator ${op} but got ${op2.right.type}`;
			}
			return _boolean(key in (left as SetV).value);
		} else {
			throw `Expecting left operand to be a set for operator ${op} but got ${left.type}`;
		}
	}

	throw `Unsupported binary operation on nodes: ${op2.left.type} ${op} ${op2.right.type}`;
}

function op_arithmetic(op: string, left: number, right: number): number {
	switch (op) {
		case "+": {
			return left + right;
		}
		case "-": {
			return left - right;
		}
		case "*": {
			return left * right;
		}
		case "/": {
			return left / right;
		}
		default:
			throw `Unimplemented arithmetic operator ${op}`;
	}
}

function op_comparative(op: string, left: number, right: number): boolean {
	switch (op) {
		case "<":
			return left < right;
		case "<=":
			return left <= right;
		case ">":
			return left > right;
		case ">=":
			return left >= right;
		default:
			throw `Unimplemented comparative operator ${op}`;
	}
}

function op_logical(op: string, left: boolean, right: boolean): boolean {
	switch (op) {
		case "&&":
			return left && right;
		case "||":
			return left || right;
		case "->":
			return !left || right;
		default:
			throw `Unimplemented logical operator ${op}`;
	}
}

// FIXME implement deep equality for list and set
function op_equality(left: Value, right: Value): boolean {
	if (
		left.type == ValueType.Function || left.type == ValueType.PFunction ||
		right.type == ValueType.Function || right.type == ValueType.PFunction
	) {
		// check for reference identity
		// NB  original nix seems to always return false on equality
		//     operations involving functions
		return left == right;
	}
	return (left as any).value == (right as any).value;
}
