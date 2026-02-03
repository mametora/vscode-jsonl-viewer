export interface JsonlRow {
  _lineNumber: number;
  _raw: string;
  _parseError?: string;
  [key: string]: unknown;
}

export interface JsonlData {
  rows: JsonlRow[];
  columns: string[];
  errors: { line: number; message: string }[];
}

export function parseJsonl(content: string): JsonlData {
  const lines = content.split(/\r?\n/);
  const rows: JsonlRow[] = [];
  const columnSet = new Set<string>();
  const errors: { line: number; message: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const lineNumber = i + 1;
    try {
      const parsed = JSON.parse(line);
      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const row: JsonlRow = {
          _lineNumber: lineNumber,
          _raw: line,
          ...parsed,
        };
        rows.push(row);

        for (const key of Object.keys(parsed)) {
          columnSet.add(key);
        }
      } else {
        rows.push({
          _lineNumber: lineNumber,
          _raw: line,
          _value: parsed,
        });
        columnSet.add("_value");
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : String(e);
      errors.push({ line: lineNumber, message: errorMessage });
      rows.push({
        _lineNumber: lineNumber,
        _raw: line,
        _parseError: errorMessage,
      });
    }
  }

  const columns = Array.from(columnSet).sort();
  return { rows, columns, errors };
}

export function detectColumnTypes(
  rows: JsonlRow[],
  columns: string[]
): Record<string, "string" | "number" | "boolean" | "object" | "mixed"> {
  const types: Record<string, Set<string>> = {};

  for (const col of columns) {
    types[col] = new Set();
  }

  for (const row of rows) {
    for (const col of columns) {
      const value = row[col];
      if (value === undefined || value === null) continue;

      const type = typeof value;
      if (type === "object") {
        types[col].add("object");
      } else {
        types[col].add(type);
      }
    }
  }

  const result: Record<string, "string" | "number" | "boolean" | "object" | "mixed"> = {};
  for (const col of columns) {
    const typeSet = types[col];
    if (typeSet.size === 0) {
      result[col] = "string";
    } else if (typeSet.size === 1) {
      result[col] = typeSet.values().next().value as "string" | "number" | "boolean" | "object";
    } else {
      result[col] = "mixed";
    }
  }

  return result;
}
