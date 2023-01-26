export enum NodeType {
	Binding = "=",
	Function = "fn",
	LetExpr = "let",
	WithExpr = "with",
	IfExpr = "if",
	SelectExpr =".",
	ApplyExpr = "call",
	Params = "params",
	BinaryExpr = "op2",
	List = "list",
	Set = "set",
	Path = "path",
	String = "str",
	Number = "num",
	Identifier = "id",
}

export interface ExprN {
	type: NodeType
}

export interface BinaryExprN extends ExprN {
	type: NodeType.BinaryExpr;
	left: ExprN;
	right: ExprN;
	// must be a binary operator
	op: string;  
}

export interface BindingN extends ExprN {
	type: NodeType.Binding;
	identifier: IdentifierN;
	value: ExprN;	
}

export interface FunctionN extends ExprN {
	type: NodeType.Function;
	param: ExprN;
	body: ExprN;
}

export interface LetExprN extends ExprN {
	type: NodeType.LetExpr;
	bindings: BindingN[];
	body: ExprN;
}

export interface WithExprN extends ExprN {
	type: NodeType.WithExpr;
	env: ExprN;
	body: ExprN;
}

export interface IfExprN extends ExprN {
	type: NodeType.IfExpr;
	condition: ExprN;
	left: ExprN;
	right: ExprN;
}

export interface SelectExprN extends ExprN {
	type: NodeType.SelectExpr;
	set: ExprN;
	member: IdentifierN;
}

export interface ApplyExprN extends ExprN {
	type: NodeType.ApplyExpr;
	fn: ExprN;
	arg: ExprN;
}

export interface ListN extends ExprN {
	type: NodeType.List;
	elements: ExprN[];
}

export interface SetN extends ExprN {
	type: NodeType.Set;
	elements: Record<string, ExprN>;	
}

export interface ParamsN extends ExprN {
	type: NodeType.Params;
	// whether each parameter is optional
	optional: Record<string, boolean>;
	// default values for optional parameters
	values: Record<string, ExprN>;
	// whether to allow extra arguments
	open: boolean;
}

export interface PathN extends ExprN {
	type: NodeType.Path;
	value: string;
}

export interface StringN extends ExprN {
	type: NodeType.String;
	value: string;
}

export interface NumberN extends ExprN {
	type: NodeType.Number;
	value: number;
	integer: boolean;
}

export interface IdentifierN extends ExprN {
	type: NodeType.Identifier;
	name: string;
}

