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
	FloatV, IntegerV, BooleanV,
	_null, _float, _integer, _boolean, _string
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
		default:
			throw "Interpretation of AST node has yet to be implemented"
	}
}

function eval_identifier(id: IdentifierN, env: Environment): Value {
	return env.get(id.name);
}

function eval_binary_expr(op2: BinaryExprN, env: Environment): Value {
	const left = evaluate(op2.left, env);
	const right = evaluate(op2.right, env);
	const op = op2.op;

	// logical operations
	// TODO lazy evaluation: need to call evaluate on right as needed
	switch (op) {
		case "&&":
		case "||":
		case "->": {
			if (left.type == ValueType.Boolean) {
				if (right.type == ValueType.Boolean) {
					return _boolean(op_logical(
						op, (left as BooleanV).value, (right as BooleanV).value
					));
				} else {
					throw `Right operand must be a boolean in ${left.type} ${op} ${right.type}`;
				}
			} else {
				throw `Left operand must be a boolean in ${left.type} ${op} ${right.type}`;
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

	// TODO ?

	throw `Unsupported binary operation: ${left.type} ${op} ${right.type}`;
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
