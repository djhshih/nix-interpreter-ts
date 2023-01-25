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
	String = "str",
	Number = "num",
	Boolean = "bool",
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
	declarations: BindingN[];
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

export interface StringN extends ExprN {
	type: NodeType.String;
	value: string;
}

export interface NumberN extends ExprN {
	type: NodeType.Number;
	value: number;
}

export interface IdentifierN extends ExprN {
	type: NodeType.Identifier;
	name: string;
}

