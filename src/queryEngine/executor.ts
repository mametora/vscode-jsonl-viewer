import type { JsonlRow } from "../jsonlDocument";
import type { ParsedQuery } from "./parser";

export interface QueryResult {
  rows: JsonlRow[];
  totalCount: number;
  filteredCount: number;
}

export function executeQuery(
  rows: JsonlRow[],
  query: ParsedQuery
): QueryResult {
  let result = [...rows];
  const totalCount = rows.length;

  // Apply WHERE filter
  if (query.where) {
    result = result.filter((row) => evaluateWhere(row, query.where));
  }

  const filteredCount = result.length;

  // Apply ORDER BY
  if (query.orderBy && query.orderBy.length > 0) {
    result.sort((a, b) => {
      for (const ob of query.orderBy!) {
        const aVal = a[ob.column];
        const bVal = b[ob.column];
        const cmp = compareValues(aVal, bVal);
        if (cmp !== 0) {
          return ob.direction === "DESC" ? -cmp : cmp;
        }
      }
      return 0;
    });
  }

  // Apply OFFSET
  if (query.offset !== null && query.offset > 0) {
    result = result.slice(query.offset);
  }

  // Apply LIMIT
  if (query.limit !== null) {
    result = result.slice(0, query.limit);
  }

  return { rows: result, totalCount, filteredCount };
}

function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;

  if (typeof a === "number" && typeof b === "number") {
    return a - b;
  }

  return String(a).localeCompare(String(b));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WhereExpr = any;

function evaluateWhere(row: JsonlRow, where: WhereExpr): boolean {
  if (!where) return true;

  switch (where.type) {
    case "binary_expr": {
      const left = evaluateExpr(row, where.left);
      const right = evaluateExpr(row, where.right);

      switch (where.operator) {
        case "=":
          return left == right;
        case "!=":
        case "<>":
          return left != right;
        case ">":
          return compareValues(left, right) > 0;
        case ">=":
          return compareValues(left, right) >= 0;
        case "<":
          return compareValues(left, right) < 0;
        case "<=":
          return compareValues(left, right) <= 0;
        case "LIKE":
          return evaluateLike(String(left ?? ""), String(right ?? ""));
        case "NOT LIKE":
          return !evaluateLike(String(left ?? ""), String(right ?? ""));
        case "IN":
          if (Array.isArray(right)) {
            return right.includes(left);
          }
          return false;
        case "NOT IN":
          if (Array.isArray(right)) {
            return !right.includes(left);
          }
          return true;
        case "IS":
          return left === right;
        case "IS NOT":
          return left !== right;
        case "AND":
          return evaluateWhere(row, where.left) && evaluateWhere(row, where.right);
        case "OR":
          return evaluateWhere(row, where.left) || evaluateWhere(row, where.right);
        default:
          throw new Error(`Unsupported operator: ${where.operator}`);
      }
    }

    case "unary_expr": {
      if (where.operator === "NOT") {
        return !evaluateWhere(row, where.expr);
      }
      throw new Error(`Unsupported unary operator: ${where.operator}`);
    }

    default:
      return Boolean(evaluateExpr(row, where));
  }
}

function evaluateExpr(row: JsonlRow, expr: WhereExpr): unknown {
  if (!expr) return null;

  switch (expr.type) {
    case "column_ref": {
      const colName = expr.column as string;
      return row[colName];
    }

    case "number":
    case "single_quote_string":
    case "double_quote_string":
    case "string": {
      return expr.value;
    }

    case "bool": {
      return expr.value;
    }

    case "null":
      return null;

    case "expr_list": {
      return expr.value.map((e: WhereExpr) => evaluateExpr(row, e));
    }

    default:
      return null;
  }
}

function evaluateLike(value: string, pattern: string): boolean {
  // Convert SQL LIKE pattern to regex
  const regexPattern = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/%/g, ".*")
    .replace(/_/g, ".");

  const regex = new RegExp(`^${regexPattern}$`, "i");
  return regex.test(value);
}
