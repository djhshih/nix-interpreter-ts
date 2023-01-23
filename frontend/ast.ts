export enum NodeType {
	Binding,
	Function,
	LetExpr,
	WithExpr,
	MemberExpr,
	CallExpr,
	BinaryExpr,
	List,
	Set,
	Number,
	Identifier
}

export interface Expr {
	type: NodeType
}

export interface Binding extends Expr {
	type: NodeType.Binding;
	identifier: string;
	value: Expr;	
}

export interface Function extends Expr {
	type: NodeType.Function;
	param: Expr;
	body: Expr;
}

export interface LetExpr extends Expr {
	type: NodeType.LetExpr;
	declarations: Binding[];
	body: Expr;
}

export interface WithExpr extends Expr {
	type: NodeType.WithExpr;
	env: Expr;
	body: Expr;
}

export interface MemberExpr extends Expr {
	type: NodeType.MemberExpr;
	set: Set;
	name: string;
}

export interface CallExpr extends Expr {
	type: NodeType.CallExpr;
	arg: Expr;
	function: Function;
}

export interface BinaryExpr extends Expr {
	type: NodeType.BinaryExpr;
	left: Expr;
	right: Expr;
	op: string;  // must be a binary operator
}

export interface List extends Expr {
	type: NodeType.List;
	elements: Expr[];
}

export interface Set extends Expr {
	type: NodeType.Set;
	elements: Record<string, Expr>;	
}

export interface Number extends Expr {
	type: NodeType.Number;
	value: number;
}

export interface Identifier extends Expr {
	type: NodeType.Identifier;
	name: string;
}

