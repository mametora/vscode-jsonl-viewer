import { Parser } from "node-sql-parser";
import type { WhereExpr } from "./types";

export interface ParsedQuery {
  columns: string[] | "*";
  where: WhereExpr | null;
  orderBy: { column: string; direction: "ASC" | "DESC" }[] | null;
  limit: number | null;
  offset: number | null;
}

const parser = new Parser();

export function parseQuery(sql: string): ParsedQuery {
  // Normalize the query to use a dummy table name
  const normalizedSql = sql.replace(/FROM\s+\w+/i, "FROM data");

  const ast = parser.astify(normalizedSql, { database: "MySQL" });

  if (Array.isArray(ast)) {
    throw new Error("Multiple statements not supported");
  }

  if (ast.type !== "select") {
    throw new Error("Only SELECT statements are supported");
  }

  const selectAst = ast as {
    columns: Array<{ expr: { type: string; column: string } }> | "*";
    where: WhereExpr | null;
    orderby: Array<{ expr: { type: string; column: string }; type?: string }> | null;
    limit: { value: Array<{ value: number }> } | null;
  };

  // Parse columns
  let columns: string[] | "*" = "*";
  if (Array.isArray(selectAst.columns)) {
    // Check if it's SELECT * (column is "*")
    const isSelectAll =
      selectAst.columns.length === 1 &&
      selectAst.columns[0].expr?.type === "column_ref" &&
      selectAst.columns[0].expr?.column === "*";

    if (!isSelectAll) {
      columns = selectAst.columns.map((col: { expr: { type: string; column: string } }) => {
        if (col.expr.type === "column_ref") {
          return col.expr.column as string;
        }
        throw new Error("Only simple column references are supported in SELECT");
      });
    }
  }

  // Parse ORDER BY
  let orderBy: { column: string; direction: "ASC" | "DESC" }[] | null = null;
  if (selectAst.orderby) {
    orderBy = selectAst.orderby.map((ob: { expr: { type: string; column: string }; type?: string }) => {
      if (ob.expr.type === "column_ref") {
        return {
          column: ob.expr.column as string,
          direction: (ob.type?.toUpperCase() as "ASC" | "DESC") || "ASC",
        };
      }
      throw new Error("Only simple column references are supported in ORDER BY");
    });
  }

  // Parse LIMIT/OFFSET
  let limit: number | null = null;
  let offset: number | null = null;
  if (selectAst.limit) {
    const limitValue = selectAst.limit.value;
    if (Array.isArray(limitValue) && limitValue.length > 0) {
      if (limitValue.length === 2) {
        offset = limitValue[0].value as number;
        limit = limitValue[1].value as number;
      } else {
        limit = limitValue[0].value as number;
      }
    }
  }

  return {
    columns,
    where: selectAst.where || null,
    orderBy,
    limit,
    offset,
  };
}
