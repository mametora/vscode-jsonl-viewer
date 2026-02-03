import { useRef, useMemo, useState, useCallback, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { JsonlRow } from "../hooks/useVscodeApi";

interface DataTableProps {
  rows: JsonlRow[];
  columns: string[];
  onLineClick: (line: number) => void;
}

const MIN_COLUMN_WIDTH = 50;
const DEFAULT_COLUMN_WIDTH = 150;
const MAX_AUTO_FIT_WIDTH = 500;

interface TooltipState {
  text: string;
  x: number;
  y: number;
}

export function DataTable({ rows, columns, onLineClick }: DataTableProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const resizeStartX = useRef<number>(0);
  const resizeStartWidth = useRef<number>(0);
  const tooltipTimeoutRef = useRef<number | null>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    overscan: 20,
  });

  const allColumns = useMemo(() => ["_lineNumber", ...columns], [columns]);

  // Reset column widths when columns change
  useEffect(() => {
    setColumnWidths({});
  }, [columns]);

  const getColumnWidth = useCallback(
    (col: string): number => {
      if (col === "_lineNumber") return 60;
      return columnWidths[col] ?? DEFAULT_COLUMN_WIDTH;
    },
    [columnWidths]
  );

  const gridTemplateColumns = useMemo(() => {
    return allColumns.map((col) => `${getColumnWidth(col)}px`).join(" ");
  }, [allColumns, getColumnWidth]);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, col: string) => {
      e.preventDefault();
      e.stopPropagation();
      setResizingColumn(col);
      resizeStartX.current = e.clientX;
      resizeStartWidth.current = getColumnWidth(col);
    },
    [getColumnWidth]
  );

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingColumn) return;
      const diff = e.clientX - resizeStartX.current;
      const newWidth = Math.max(MIN_COLUMN_WIDTH, resizeStartWidth.current + diff);
      setColumnWidths((prev) => ({ ...prev, [resizingColumn]: newWidth }));
    },
    [resizingColumn]
  );

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  // Global mouse event listeners for resize
  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener("mousemove", handleResizeMove);
      document.addEventListener("mouseup", handleResizeEnd);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      return () => {
        document.removeEventListener("mousemove", handleResizeMove);
        document.removeEventListener("mouseup", handleResizeEnd);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  // Calculate optimal column width based on content
  const calculateOptimalWidth = useCallback(
    (col: string): number => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return DEFAULT_COLUMN_WIDTH;

      // Get computed font style
      const style = getComputedStyle(document.body);
      const fontFamily = style.getPropertyValue("--vscode-editor-font-family") || "monospace";
      const fontSize = style.getPropertyValue("--vscode-editor-font-size") || "13px";
      ctx.font = `${fontSize} ${fontFamily}`;

      // Measure header text
      let maxWidth = ctx.measureText(col).width;

      // Sample rows to measure content (limit to first 100 rows for performance)
      const sampleSize = Math.min(rows.length, 100);
      for (let i = 0; i < sampleSize; i++) {
        const value = rows[i][col];
        let text = "";
        if (value === null) {
          text = "null";
        } else if (value !== undefined) {
          text = typeof value === "object" ? JSON.stringify(value) : String(value);
        }
        const textWidth = ctx.measureText(text).width;
        maxWidth = Math.max(maxWidth, textWidth);
      }

      // Add padding (12px on each side)
      const paddedWidth = maxWidth + 24;
      return Math.min(Math.max(paddedWidth, MIN_COLUMN_WIDTH), MAX_AUTO_FIT_WIDTH);
    },
    [rows]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent, col: string) => {
      e.preventDefault();
      e.stopPropagation();
      const optimalWidth = calculateOptimalWidth(col);
      setColumnWidths((prev) => ({ ...prev, [col]: optimalWidth }));
    },
    [calculateOptimalWidth]
  );

  const handleCellMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, text: string) => {
      const target = e.currentTarget;
      // Check if text is overflowing
      if (target.scrollWidth > target.clientWidth) {
        // Clear any existing timeout
        if (tooltipTimeoutRef.current) {
          window.clearTimeout(tooltipTimeoutRef.current);
        }
        // Delay tooltip display slightly
        tooltipTimeoutRef.current = window.setTimeout(() => {
          const rect = target.getBoundingClientRect();
          setTooltip({
            text,
            x: rect.left,
            y: rect.bottom + 4,
          });
        }, 300);
      }
    },
    []
  );

  const handleCellMouseLeave = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      window.clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }
    setTooltip(null);
  }, []);

  // Cleanup tooltip timeout on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        window.clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

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
              <span className="header-text">{col === "_lineNumber" ? "#" : col}</span>
              {col !== "_lineNumber" && (
                <div
                  className={`resize-handle ${resizingColumn === col ? "resizing" : ""}`}
                  onMouseDown={(e) => handleResizeStart(e, col)}
                  onDoubleClick={(e) => handleDoubleClick(e, col)}
                />
              )}
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
                    <div
                      key={col}
                      className={`table-cell ${className}`}
                      onMouseEnter={(e) => handleCellMouseEnter(e, text)}
                      onMouseLeave={handleCellMouseLeave}
                    >
                      {text}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {tooltip && (
        <div
          className="cell-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
