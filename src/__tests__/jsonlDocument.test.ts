import { describe, it, expect } from "vitest";
import { parseJsonl, detectColumnTypes } from "../jsonlDocument";

describe("parseJsonl", () => {
  describe("basic parsing", () => {
    it("should parse valid JSONL content", () => {
      const content = '{"name": "Alice", "age": 30}\n{"name": "Bob", "age": 25}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should extract columns from objects", () => {
      const content = '{"name": "Alice", "age": 30}\n{"name": "Bob", "status": "active"}';
      const result = parseJsonl(content);
      expect(result.columns).toContain("name");
      expect(result.columns).toContain("age");
      expect(result.columns).toContain("status");
    });

    it("should sort columns alphabetically", () => {
      const content = '{"zebra": 1, "alpha": 2, "middle": 3}';
      const result = parseJsonl(content);
      expect(result.columns).toEqual(["alpha", "middle", "zebra"]);
    });

    it("should include _lineNumber for each row", () => {
      const content = '{"a": 1}\n{"b": 2}\n{"c": 3}';
      const result = parseJsonl(content);
      expect(result.rows[0]._lineNumber).toBe(1);
      expect(result.rows[1]._lineNumber).toBe(2);
      expect(result.rows[2]._lineNumber).toBe(3);
    });

    it("should include _raw for each row", () => {
      const content = '{"name": "Alice"}';
      const result = parseJsonl(content);
      expect(result.rows[0]._raw).toBe('{"name": "Alice"}');
    });
  });

  describe("line ending handling", () => {
    it("should handle LF line endings", () => {
      const content = '{"a": 1}\n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
    });

    it("should handle CRLF line endings", () => {
      const content = '{"a": 1}\r\n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
    });

    it("should handle mixed line endings", () => {
      const content = '{"a": 1}\r\n{"b": 2}\n{"c": 3}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(3);
    });
  });

  describe("empty line handling", () => {
    it("should skip empty lines", () => {
      const content = '{"a": 1}\n\n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
    });

    it("should skip whitespace-only lines", () => {
      const content = '{"a": 1}\n   \n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
    });

    it("should handle trailing newline", () => {
      const content = '{"a": 1}\n{"b": 2}\n';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(2);
    });

    it("should handle empty content", () => {
      const result = parseJsonl("");
      expect(result.rows).toHaveLength(0);
      expect(result.columns).toHaveLength(0);
    });
  });

  describe("line number accuracy", () => {
    it("should track correct line numbers with empty lines", () => {
      const content = '{"a": 1}\n\n\n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows[0]._lineNumber).toBe(1);
      expect(result.rows[1]._lineNumber).toBe(4);
    });

    it("should track correct line numbers with errors", () => {
      const content = '{"a": 1}\ninvalid json\n{"b": 2}';
      const result = parseJsonl(content);
      expect(result.rows[0]._lineNumber).toBe(1);
      expect(result.rows[1]._lineNumber).toBe(2);
      expect(result.rows[2]._lineNumber).toBe(3);
    });
  });

  describe("error handling", () => {
    it("should collect parse errors", () => {
      const content = '{"valid": 1}\ninvalid json\n{"valid": 2}';
      const result = parseJsonl(content);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].line).toBe(2);
    });

    it("should include error message", () => {
      const content = 'invalid json';
      const result = parseJsonl(content);
      expect(result.errors[0].message).toBeDefined();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });

    it("should add _parseError to invalid rows", () => {
      const content = '{"valid": 1}\ninvalid json';
      const result = parseJsonl(content);
      expect(result.rows[1]._parseError).toBeDefined();
    });

    it("should preserve raw content for invalid rows", () => {
      const content = 'not valid json';
      const result = parseJsonl(content);
      expect(result.rows[0]._raw).toBe("not valid json");
    });
  });

  describe("non-object JSON values", () => {
    it("should handle array values", () => {
      const content = '[1, 2, 3]';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0]._value).toEqual([1, 2, 3]);
      expect(result.columns).toContain("_value");
    });

    it("should handle primitive values", () => {
      const content = '"hello"\n42\ntrue\nnull';
      const result = parseJsonl(content);
      expect(result.rows).toHaveLength(4);
      expect(result.rows[0]._value).toBe("hello");
      expect(result.rows[1]._value).toBe(42);
      expect(result.rows[2]._value).toBe(true);
      expect(result.rows[3]._value).toBeNull();
    });

    it("should mix objects and primitives", () => {
      const content = '{"name": "Alice"}\n42\n{"name": "Bob"}';
      const result = parseJsonl(content);
      expect(result.rows[0].name).toBe("Alice");
      expect(result.rows[1]._value).toBe(42);
      expect(result.rows[2].name).toBe("Bob");
    });
  });

  describe("complex JSON objects", () => {
    it("should handle nested objects", () => {
      const content = '{"user": {"name": "Alice", "age": 30}}';
      const result = parseJsonl(content);
      expect(result.rows[0].user).toEqual({ name: "Alice", age: 30 });
    });

    it("should handle arrays in objects", () => {
      const content = '{"tags": ["a", "b", "c"]}';
      const result = parseJsonl(content);
      expect(result.rows[0].tags).toEqual(["a", "b", "c"]);
    });
  });
});

describe("detectColumnTypes", () => {
  it("should detect string type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", name: "Alice" },
      { _lineNumber: 2, _raw: "", name: "Bob" },
    ];
    const result = detectColumnTypes(rows, ["name"]);
    expect(result.name).toBe("string");
  });

  it("should detect number type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", age: 30 },
      { _lineNumber: 2, _raw: "", age: 25 },
    ];
    const result = detectColumnTypes(rows, ["age"]);
    expect(result.age).toBe("number");
  });

  it("should detect boolean type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", active: true },
      { _lineNumber: 2, _raw: "", active: false },
    ];
    const result = detectColumnTypes(rows, ["active"]);
    expect(result.active).toBe("boolean");
  });

  it("should detect object type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", data: { nested: true } },
      { _lineNumber: 2, _raw: "", data: { nested: false } },
    ];
    const result = detectColumnTypes(rows, ["data"]);
    expect(result.data).toBe("object");
  });

  it("should detect mixed type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", value: "string" },
      { _lineNumber: 2, _raw: "", value: 123 },
    ];
    const result = detectColumnTypes(rows, ["value"]);
    expect(result.value).toBe("mixed");
  });

  it("should default to string for empty columns", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", value: null },
      { _lineNumber: 2, _raw: "", value: undefined },
    ];
    const result = detectColumnTypes(rows, ["value"]);
    expect(result.value).toBe("string");
  });

  it("should ignore null and undefined when determining type", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", value: null },
      { _lineNumber: 2, _raw: "", value: 42 },
      { _lineNumber: 3, _raw: "", value: undefined },
    ];
    const result = detectColumnTypes(rows, ["value"]);
    expect(result.value).toBe("number");
  });

  it("should handle multiple columns", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", name: "Alice", age: 30, active: true },
      { _lineNumber: 2, _raw: "", name: "Bob", age: 25, active: false },
    ];
    const result = detectColumnTypes(rows, ["name", "age", "active"]);
    expect(result.name).toBe("string");
    expect(result.age).toBe("number");
    expect(result.active).toBe("boolean");
  });

  it("should treat arrays as objects", () => {
    const rows = [
      { _lineNumber: 1, _raw: "", items: [1, 2, 3] },
      { _lineNumber: 2, _raw: "", items: ["a", "b"] },
    ];
    const result = detectColumnTypes(rows, ["items"]);
    expect(result.items).toBe("object");
  });
});
