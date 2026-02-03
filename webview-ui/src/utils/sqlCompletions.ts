import {
  CompletionContext,
  CompletionResult,
  Completion,
} from "@codemirror/autocomplete";

const SQL_KEYWORDS: Completion[] = [
  { label: "SELECT", type: "keyword", detail: "SQL keyword" },
  { label: "FROM", type: "keyword", detail: "SQL keyword" },
  { label: "WHERE", type: "keyword", detail: "SQL keyword" },
  { label: "AND", type: "keyword", detail: "SQL keyword" },
  { label: "OR", type: "keyword", detail: "SQL keyword" },
  { label: "NOT", type: "keyword", detail: "SQL keyword" },
  { label: "IN", type: "keyword", detail: "SQL keyword" },
  { label: "LIKE", type: "keyword", detail: "SQL keyword" },
  { label: "IS", type: "keyword", detail: "SQL keyword" },
  { label: "NULL", type: "keyword", detail: "SQL keyword" },
  { label: "ORDER BY", type: "keyword", detail: "SQL keyword" },
  { label: "ASC", type: "keyword", detail: "SQL keyword" },
  { label: "DESC", type: "keyword", detail: "SQL keyword" },
  { label: "LIMIT", type: "keyword", detail: "SQL keyword" },
  { label: "OFFSET", type: "keyword", detail: "SQL keyword" },
  { label: "BETWEEN", type: "keyword", detail: "SQL keyword" },
  { label: "TRUE", type: "keyword", detail: "SQL keyword" },
  { label: "FALSE", type: "keyword", detail: "SQL keyword" },
];

const TABLE_COMPLETIONS: Completion[] = [
  { label: "data", type: "class", detail: "table name" },
];

export function createSqlCompletions(columns: string[]) {
  const columnCompletions: Completion[] = columns.map((col) => ({
    label: col,
    type: "property",
    detail: "column",
    boost: 1,
  }));

  return function sqlCompletions(
    context: CompletionContext
  ): CompletionResult | null {
    const word = context.matchBefore(/[\w.]+/);

    if (!word && !context.explicit) {
      return null;
    }

    const from = word ? word.from : context.pos;
    const text = word ? word.text.toLowerCase() : "";

    const beforeText = context.state.doc
      .sliceString(0, context.pos)
      .toLowerCase();

    const allCompletions: Completion[] = [];

    // After FROM, suggest table name
    if (/\bfrom\s+$/i.test(beforeText) || /\bfrom\s+\w*$/i.test(beforeText)) {
      allCompletions.push(...TABLE_COMPLETIONS);
    }

    // After SELECT, WHERE, AND, OR, ORDER BY - suggest columns
    if (
      /\bselect\s+$/i.test(beforeText) ||
      /\bselect\s+[\w,\s*]+,\s*$/i.test(beforeText) ||
      /\bwhere\s+$/i.test(beforeText) ||
      /\band\s+$/i.test(beforeText) ||
      /\bor\s+$/i.test(beforeText) ||
      /\border\s+by\s+$/i.test(beforeText) ||
      /\border\s+by\s+[\w,\s]+,\s*$/i.test(beforeText)
    ) {
      allCompletions.push(...columnCompletions);
    }

    // Always include keywords if typing
    if (text.length > 0 || context.explicit) {
      allCompletions.push(...SQL_KEYWORDS);

      // Include columns if not specifically after FROM
      if (!/\bfrom\s+\w*$/i.test(beforeText)) {
        allCompletions.push(...columnCompletions);
      }
    }

    // Empty input - suggest SELECT
    if (beforeText.trim() === "" || /^\s*$/.test(beforeText)) {
      allCompletions.push({
        label: "SELECT * FROM data",
        type: "text",
        detail: "query template",
        boost: 2,
      });
      allCompletions.push({
        label: "SELECT",
        type: "keyword",
        detail: "SQL keyword",
        boost: 1,
      });
    }

    if (allCompletions.length === 0) {
      return null;
    }

    // Remove duplicates
    const seen = new Set<string>();
    const uniqueCompletions = allCompletions.filter((c) => {
      if (seen.has(c.label)) {
        return false;
      }
      seen.add(c.label);
      return true;
    });

    return {
      from,
      options: uniqueCompletions,
      validFor: /^[\w]*$/,
    };
  };
}
