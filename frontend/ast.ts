export enum NodeType {
	Binding = "=",
	Function = "fn",
	LetExpr = "let",
	WithExpr = "with",
	MemberExpr =".",
	CallExpr = "call",
	BinaryExpr = "op",
	List = "list",
	Set = "set",
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
	declarations: BindingN[];
	body: ExprN;
}

export interface WithExprN extends ExprN {
	type: NodeType.WithExpr;
	env: ExprN;
	body: ExprN;
}

export interface MemberExprN extends ExprN {
	type: NodeType.MemberExpr;
	set: ExprN;
	member: IdentifierN;
}

export interface CallExprN extends ExprN {
	type: NodeType.CallExpr;
	arg: ExprN;
	function: FunctionN;
}

export interface ListN extends ExprN {
	type: NodeType.List;
	elements: ExprN[];
}

export interface SetN extends ExprN {
	type: NodeType.Set;
	elements: Record<string, ExprN>;	
}

export interface NumberN extends ExprN {
	type: NodeType.Number;
	value: number;
}

export interface IdentifierN extends ExprN {
	type: NodeType.Identifier;
	name: string;
}

