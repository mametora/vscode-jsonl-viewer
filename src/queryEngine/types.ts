/**
 * Type definitions for SQL expression AST nodes from node-sql-parser.
 * These are simplified types covering the subset we use.
 */

export interface ColumnRefExpr {
  type: "column_ref";
  table: string | null;
  column: string;
}

export interface NumberExpr {
  type: "number";
  value: number;
}

export interface StringExpr {
  type: "single_quote_string" | "double_quote_string" | "string";
  value: string;
}

export interface BoolExpr {
  type: "bool";
  value: boolean;
}

export interface NullExpr {
  type: "null";
  value: null;
}

export interface ExprListExpr {
  type: "expr_list";
  value: WhereExpr[];
}

export interface BinaryExpr {
  type: "binary_expr";
  operator: string;
  left: WhereExpr;
  right: WhereExpr;
}

export interface UnaryExpr {
  type: "unary_expr";
  operator: string;
  expr: WhereExpr;
}

export type WhereExpr =
  | ColumnRefExpr
  | NumberExpr
  | StringExpr
  | BoolExpr
  | NullExpr
  | ExprListExpr
  | BinaryExpr
  | UnaryExpr;
