import { describe, it, expect } from "vitest";
import { executeQuery } from "../../queryEngine/executor";
import { parseQuery } from "../../queryEngine/parser";
import type { JsonlRow } from "../../jsonlDocument";

const createRow = (lineNumber: number, data: Record<string, unknown>): JsonlRow => ({
  _lineNumber: lineNumber,
  _raw: JSON.stringify(data),
  ...data,
});

const sampleRows: JsonlRow[] = [
  createRow(1, { name: "Alice", age: 30, status: "active" }),
  createRow(2, { name: "Bob", age: 25, status: "inactive" }),
  createRow(3, { name: "Charlie", age: 35, status: "active" }),
  createRow(4, { name: "Diana", age: 28, status: "pending" }),
  createRow(5, { name: "Eve", age: 22, status: "active" }),
];

describe("executeQuery", () => {
  describe("basic queries", () => {
    it("should return all rows for SELECT *", () => {
      const query = parseQuery("SELECT * FROM data");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(5);
      expect(result.totalCount).toBe(5);
      expect(result.filteredCount).toBe(5);
    });

    it("should return rows without modifying original array", () => {
      const query = parseQuery("SELECT * FROM data");
      const originalLength = sampleRows.length;
      executeQuery(sampleRows, query);
      expect(sampleRows).toHaveLength(originalLength);
    });
  });

  describe("WHERE filtering", () => {
    it("should filter with equality operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE status = 'active'");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(3);
      expect(result.filteredCount).toBe(3);
      expect(result.totalCount).toBe(5);
      expect(result.rows.every((r) => r.status === "active")).toBe(true);
    });

    it("should filter with inequality operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE status != 'active'");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((r) => r.status !== "active")).toBe(true);
    });

    it("should filter with greater than operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE age > 28");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((r) => (r.age as number) > 28)).toBe(true);
    });

    it("should filter with greater than or equal operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE age >= 28");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(3);
      expect(result.rows.every((r) => (r.age as number) >= 28)).toBe(true);
    });

    it("should filter with less than operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE age < 28");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
      expect(result.rows.every((r) => (r.age as number) < 28)).toBe(true);
    });

    it("should filter with less than or equal operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE age <= 28");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(3);
      expect(result.rows.every((r) => (r.age as number) <= 28)).toBe(true);
    });

    it("should filter with LIKE operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE name LIKE 'A%'");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe("Alice");
    });

    it("should filter with LIKE operator containing wildcard in middle", () => {
      const query = parseQuery("SELECT * FROM data WHERE name LIKE '%li%'");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2); // Alice, Charlie
    });

    it("should filter with IN operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE status IN ('active', 'pending')");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(4);
    });

    it("should filter with NOT IN operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE status NOT IN ('active', 'pending')");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].status).toBe("inactive");
    });

    it("should filter with AND operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE status = 'active' AND age > 25");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
    });

    it("should filter with OR operator", () => {
      const query = parseQuery("SELECT * FROM data WHERE age < 25 OR age > 30");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("ORDER BY sorting", () => {
    it("should sort by column ASC", () => {
      const query = parseQuery("SELECT * FROM data ORDER BY age ASC");
      const result = executeQuery(sampleRows, query);
      const ages = result.rows.map((r) => r.age as number);
      expect(ages).toEqual([22, 25, 28, 30, 35]);
    });

    it("should sort by column DESC", () => {
      const query = parseQuery("SELECT * FROM data ORDER BY age DESC");
      const result = executeQuery(sampleRows, query);
      const ages = result.rows.map((r) => r.age as number);
      expect(ages).toEqual([35, 30, 28, 25, 22]);
    });

    it("should sort by string column", () => {
      const query = parseQuery("SELECT * FROM data ORDER BY name ASC");
      const result = executeQuery(sampleRows, query);
      const names = result.rows.map((r) => r.name);
      expect(names).toEqual(["Alice", "Bob", "Charlie", "Diana", "Eve"]);
    });

    it("should sort by multiple columns", () => {
      const rows: JsonlRow[] = [
        createRow(1, { name: "Alice", group: "A" }),
        createRow(2, { name: "Bob", group: "B" }),
        createRow(3, { name: "Charlie", group: "A" }),
        createRow(4, { name: "Diana", group: "B" }),
      ];
      const query = parseQuery("SELECT * FROM data ORDER BY `group` ASC, name DESC");
      const result = executeQuery(rows, query);
      const names = result.rows.map((r) => r.name);
      expect(names).toEqual(["Charlie", "Alice", "Diana", "Bob"]);
    });
  });

  describe("LIMIT and OFFSET", () => {
    it("should apply LIMIT", () => {
      const query = parseQuery("SELECT * FROM data LIMIT 3");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(3);
      expect(result.filteredCount).toBe(5);
    });

    it("should apply OFFSET", () => {
      // Using LIMIT offset, count syntax
      const query = parseQuery("SELECT * FROM data LIMIT 2, 3");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(3);
      expect(result.rows[0].name).toBe("Charlie");
    });

    it("should apply OFFSET with LIMIT larger than remaining", () => {
      // Using LIMIT offset, count syntax
      const query = parseQuery("SELECT * FROM data LIMIT 3, 10");
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("null and undefined handling", () => {
    it("should handle rows with null values", () => {
      const rows: JsonlRow[] = [
        createRow(1, { name: "Alice", score: 100 }),
        createRow(2, { name: "Bob", score: null }),
        createRow(3, { name: "Charlie", score: 80 }),
      ];
      const query = parseQuery("SELECT * FROM data ORDER BY score ASC");
      const result = executeQuery(rows, query);
      expect(result.rows[0].score).toBeNull();
    });

    it("should handle rows with missing columns", () => {
      const rows: JsonlRow[] = [
        createRow(1, { name: "Alice", age: 30 }),
        createRow(2, { name: "Bob" }),
        createRow(3, { name: "Charlie", age: 25 }),
      ];
      const query = parseQuery("SELECT * FROM data WHERE age > 20");
      const result = executeQuery(rows, query);
      expect(result.rows).toHaveLength(2);
    });
  });

  describe("combined queries", () => {
    it("should apply WHERE, ORDER BY, and LIMIT together", () => {
      const query = parseQuery(
        "SELECT * FROM data WHERE status = 'active' ORDER BY age DESC LIMIT 2"
      );
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(2);
      expect(result.rows[0].name).toBe("Charlie");
      expect(result.rows[1].name).toBe("Alice");
      expect(result.totalCount).toBe(5);
      expect(result.filteredCount).toBe(3);
    });

    it("should apply WHERE, ORDER BY, LIMIT, and OFFSET together", () => {
      // Using LIMIT offset, count syntax
      const query = parseQuery(
        "SELECT * FROM data WHERE status = 'active' ORDER BY age ASC LIMIT 1, 1"
      );
      const result = executeQuery(sampleRows, query);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].name).toBe("Alice");
    });
  });
});
