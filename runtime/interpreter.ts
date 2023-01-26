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
	BinaryExprN,
	ListN,
	SetN,
	StringN,
	NumberN,
	IdentifierN,
} from "../frontend/ast.ts";

import {
	ValueType, Value,
	FloatV, IntegerV, BooleanV, SetV,
	_null, _float, _integer, _boolean, _string, _set,
} from "./values.ts";

import Environment from "./environment.ts";

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
		case NodeType.BinaryExpr:
			return eval_binary_expr((expr as BinaryExprN), env);
		case NodeType.Set: {
			let record = (expr as SetN).elements;
			let set = _set();
			for (const name in record) {
				set.value[name] = evaluate(record[name], env);
			}
			return set;
		}
		case NodeType.LetExpr: {
			let letexpr = (expr as LetExprN);
			let env2 = new Environment(env);
			// FIXME binding order will matter here; rec behaviour is partially implemented
			for (const binding of letexpr.bindings) {
				eval_binding(binding, env2);
			}
			return evaluate(letexpr.body, env2);
		}
		default:
			throw `Interpretation of AST node type has yet to be implemented: ${expr.type}`
	}
}

function eval_identifier(id: IdentifierN, env: Environment): Value {
	return env.get(id.name);
}

function eval_binding(binding: BindingN, env: Environment): Environment {
	env.set(binding.identifier.name, evaluate(binding.value, env));
	return env;
}

function eval_binary_expr(op2: BinaryExprN, env: Environment): Value {
	const left = evaluate(op2.left, env);
	const op = op2.op;

	// logical operations
	// TODO lazy evaluation: need to call evaluate on right as needed
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
					throw `Right operand must be a boolean in ${left.type} ${op} ${op2.right.type}`;
				}
			} else {
				throw `Left operand must be a boolean in ${left.type} ${op} ${op2.right.type}`;
			}
		}
	}

	// equality operations
	// TODO == !=

	// string/path concatenations
	// TODO ++

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
				throw `Left operand must be a number in ${left.type} ${op} ${right.type}`;
			}
			if (right.type == ValueType.Float) {
				rightv = (right as FloatV).value;
			} else if (right.type == ValueType.Integer) {
				rightv = (right as IntegerV).value;
			} else {
				throw `Right operand must be a number in ${left.type} ${op} ${right.type}`;
			}
			return _boolean(op_comparative(op, leftv, rightv));
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
				throw `Right operand must be an identifier in ${left.type} ${op} ${op2.right.type}`;
			}
			return _boolean(key in (left as SetV).value);
		} else {
			throw `Left operand must be a set in ${left.type} ${op} ${op2.right.type}`;
		}
	}

	throw `Unsupported binary operation: ${op2.left.type} ${op} ${op2.right.type}`;
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

