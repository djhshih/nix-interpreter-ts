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
	_float, _integer, _string
} from "./values.ts";

import Environment from "./environment.ts";

export default class Interpreter {
	private env: Environment;

	constructor() {
		this.env = new Environment();
	}

	public evaluate(expr: ExprN): Value {
		switch (expr.type) {
			case NodeType.Identifier:
				return eval_identifier(expr as IdentifierN, this.env);
			case NodeType.Number:
				// TODO recognize integer; may need to change lexer
				return _float((expr as NumberN).value);
			case NodeType.String:
				return _string((expr as StringN).value);
			default:
				throw "Interpretation of AST node has yet to be implemented"
		}
	}
}

function eval_identifier(id: IdentifierN, env: Environment): Value {
	return env.get(id.name);
}

