interface StatusBarProps {
  totalRows: number;
  filteredRows: number | null;
  columns: number;
  errors: number;
  isFiltered: boolean;
}

export function StatusBar({
  totalRows,
  filteredRows,
  columns,
  errors,
  isFiltered,
}: StatusBarProps) {
  return (
    <div className="status-bar">
      <div className="status-bar-left">
        <span>
          {isFiltered
            ? `${filteredRows} / ${totalRows} rows`
            : `${totalRows} rows`}
        </span>
        <span>{columns} columns</span>
      </div>
      <div className="status-bar-right">
        {errors > 0 && (
          <span style={{ color: "var(--vscode-editorWarning-foreground)" }}>
            {errors} parse error{errors > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  );
}
