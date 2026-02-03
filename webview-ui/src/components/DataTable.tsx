import { useRef, useMemo } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { JsonlRow } from "../hooks/useVscodeApi";

interface DataTableProps {
  rows: JsonlRow[];
  columns: string[];
  onLineClick: (line: number) => void;
}

export function DataTable({ rows, columns, onLineClick }: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 20,
  });

  const allColumns = useMemo(() => ["_lineNumber", ...columns], [columns]);

  const gridTemplateColumns = useMemo(() => {
    return allColumns
      .map((col) => (col === "_lineNumber" ? "60px" : "minmax(100px, 1fr)"))
      .join(" ");
  }, [allColumns]);

  const formatValue = (value: unknown): { text: string; className: string } => {
    if (value === undefined) {
      return { text: "", className: "" };
    }
    if (value === null) {
      return { text: "null", className: "cell-null" };
    }
    if (typeof value === "number") {
      return { text: String(value), className: "cell-number" };
    }
    if (typeof value === "boolean") {
      return { text: String(value), className: "cell-boolean" };
    }
    if (typeof value === "string") {
      return { text: value, className: "cell-string" };
    }
    if (typeof value === "object") {
      return { text: JSON.stringify(value), className: "cell-object" };
    }
    return { text: String(value), className: "" };
  };

  if (rows.length === 0) {
    return (
      <div className="empty-state">
        <span>No data to display</span>
      </div>
    );
  }

  return (
    <div className="table-container" ref={parentRef}>
      <div className="virtual-table" style={{ minWidth: "max-content" }}>
        <div
          className="table-header"
          style={{ display: "grid", gridTemplateColumns }}
        >
          {allColumns.map((col) => (
            <div
              key={col}
              className={`table-cell header-cell ${col === "_lineNumber" ? "line-number-cell" : ""}`}
            >
              {col === "_lineNumber" ? "#" : col}
            </div>
          ))}
        </div>
        <div
          className="table-body"
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            position: "relative",
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const row = rows[virtualRow.index];
            const hasError = row._parseError !== undefined;

            return (
              <div
                key={virtualRow.key}
                className="table-row"
                style={{
                  display: "grid",
                  gridTemplateColumns,
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                {allColumns.map((col, colIndex) => {
                  if (col === "_lineNumber") {
                    return (
                      <div
                        key={col}
                        className="table-cell line-number-cell clickable"
                        onClick={() => onLineClick(row._lineNumber)}
                        title="Click to go to line"
                      >
                        {row._lineNumber}
                      </div>
                    );
                  }

                  if (hasError && colIndex === 1) {
                    return (
                      <div
                        key={col}
                        className="table-cell cell-error"
                        style={{ gridColumn: `2 / -1` }}
                      >
                        Parse error: {row._parseError}
                      </div>
                    );
                  }

                  if (hasError && colIndex > 1) {
                    return null;
                  }

                  const { text, className } = formatValue(row[col]);
                  return (
                    <div key={col} className={`table-cell ${className}`} title={text}>
                      {text}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
