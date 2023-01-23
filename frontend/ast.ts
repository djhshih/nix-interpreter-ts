export type Node = 
	  "Binding"
	| "Function"
  | "LetExpr"
	| "WithExpr"
	| "MemberExpr"
	| "CallExpr"
	| "BinaryExpr"
	| "List"
	| "Set"
	| "Number"
	| "Identifier"
	;

export interface Expr {
	type: Node
}

export interface Binding extends Expr {
	type: "Binding";
	identifier: string;
	value: Expr;	
}

export interface Function extends Expr {
	type: "Function";
	param: string[];
	body: Expr;
}

export interface LetExpr extends Expr {
	type: "LetExpr";
	declarations: Binding[];
	body: Expr;
}

export interface WithExpr extends Expr {
	type: "WithExpr";
	set: Set;
	body: Expr;
}

export interface MemberExpr extends Expr {
	type: "MemberExpr";
	set: Set;
	name: string;
}

export interface CallExpr extends Expr {
	type: "CallExpr";
	arg: Expr;
	function: Function;
}

export interface BinaryExpr extends Expr {
	type: "BinaryExpr";
	left: Expr;
	right: Expr;
	op: string;  // must be a binary operator
}

export interface List extends Expr {
	type: "List";
	elements: Expr[];
}

export interface Set extends Expr {
	type: "Set";
	elements: Record<string, Expr>;	
}

export interface Number extends Expr {
	type: "Number";
	value: number;
}

export interface Identifier extends Expr {
	type: "Identifier";
	name: string;
}

