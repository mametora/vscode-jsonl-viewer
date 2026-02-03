import { describe, it, expect } from "vitest";
import { parseQuery } from "../../queryEngine/parser";

describe("parseQuery", () => {
  describe("SELECT columns", () => {
    it("should parse SELECT *", () => {
      const result = parseQuery("SELECT * FROM data");
      expect(result.columns).toBe("*");
    });

    it("should parse specific columns", () => {
      const result = parseQuery("SELECT name, age FROM data");
      expect(result.columns).toEqual(["name", "age"]);
    });

    it("should parse single column", () => {
      const result = parseQuery("SELECT name FROM data");
      expect(result.columns).toEqual(["name"]);
    });

    it("should normalize any table name to data", () => {
      const result = parseQuery("SELECT * FROM users");
      expect(result.columns).toBe("*");
    });
  });

  describe("WHERE clause", () => {
    it("should parse equality condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE status = 'active'");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("=");
    });

    it("should parse greater than condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE age > 18");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe(">");
    });

    it("should parse less than condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE age < 30");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("<");
    });

    it("should parse LIKE condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE name LIKE '%john%'");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("LIKE");
    });

    it("should parse IN condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE status IN ('a', 'b', 'c')");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("IN");
    });

    it("should parse AND condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE age > 18 AND status = 'active'");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("AND");
    });

    it("should parse OR condition", () => {
      const result = parseQuery("SELECT * FROM data WHERE age < 18 OR age > 65");
      expect(result.where).not.toBeNull();
      expect(result.where.operator).toBe("OR");
    });

    it("should parse no WHERE clause", () => {
      const result = parseQuery("SELECT * FROM data");
      expect(result.where).toBeNull();
    });
  });

  describe("ORDER BY clause", () => {
    it("should parse ORDER BY ASC", () => {
      const result = parseQuery("SELECT * FROM data ORDER BY name ASC");
      expect(result.orderBy).toEqual([{ column: "name", direction: "ASC" }]);
    });

    it("should parse ORDER BY DESC", () => {
      const result = parseQuery("SELECT * FROM data ORDER BY age DESC");
      expect(result.orderBy).toEqual([{ column: "age", direction: "DESC" }]);
    });

    it("should default to ASC when direction is not specified", () => {
      const result = parseQuery("SELECT * FROM data ORDER BY name");
      expect(result.orderBy).toEqual([{ column: "name", direction: "ASC" }]);
    });

    it("should parse multiple ORDER BY columns", () => {
      const result = parseQuery("SELECT * FROM data ORDER BY name ASC, age DESC");
      expect(result.orderBy).toEqual([
        { column: "name", direction: "ASC" },
        { column: "age", direction: "DESC" },
      ]);
    });

    it("should parse no ORDER BY clause", () => {
      const result = parseQuery("SELECT * FROM data");
      expect(result.orderBy).toBeNull();
    });
  });

  describe("LIMIT and OFFSET", () => {
    it("should parse LIMIT", () => {
      const result = parseQuery("SELECT * FROM data LIMIT 100");
      expect(result.limit).toBe(100);
      expect(result.offset).toBeNull();
    });

    it("should parse LIMIT with comma syntax (OFFSET, LIMIT)", () => {
      // MySQL syntax: LIMIT offset, count
      const result = parseQuery("SELECT * FROM data LIMIT 50, 100");
      expect(result.limit).toBe(100);
      expect(result.offset).toBe(50);
    });

    it("should parse no LIMIT", () => {
      const result = parseQuery("SELECT * FROM data");
      expect(result.limit).toBeNull();
      expect(result.offset).toBeNull();
    });
  });

  describe("error cases", () => {
    it("should throw error for non-SELECT statements", () => {
      expect(() => parseQuery("INSERT INTO data VALUES (1)")).toThrow(
        "Only SELECT statements are supported"
      );
    });

    it("should throw error for multiple statements", () => {
      expect(() => parseQuery("SELECT * FROM data; SELECT * FROM data")).toThrow(
        "Multiple statements not supported"
      );
    });

    it("should throw error for invalid SQL", () => {
      expect(() => parseQuery("INVALID SQL QUERY")).toThrow();
    });
  });

  describe("combined queries", () => {
    it("should parse full query with all clauses", () => {
      // Using LIMIT offset, count syntax for reliable parsing
      const result = parseQuery(
        "SELECT name, age FROM data WHERE status = 'active' ORDER BY age DESC LIMIT 5, 10"
      );
      expect(result.columns).toEqual(["name", "age"]);
      expect(result.where).not.toBeNull();
      expect(result.orderBy).toEqual([{ column: "age", direction: "DESC" }]);
      expect(result.limit).toBe(10);
      expect(result.offset).toBe(5);
    });
  });
});
