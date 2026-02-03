import { useState, useCallback, KeyboardEvent } from "react";

interface QueryInputProps {
  onExecute: (sql: string) => void;
  onClear: () => void;
  error: string | null;
  hasQuery: boolean;
}

export function QueryInput({
  onExecute,
  onClear,
  error,
  hasQuery,
}: QueryInputProps) {
  const [query, setQuery] = useState("");

  const handleExecute = useCallback(() => {
    if (query.trim()) {
      onExecute(query.trim());
    }
  }, [query, onExecute]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleExecute();
      }
    },
    [handleExecute]
  );

  const handleClear = useCallback(() => {
    setQuery("");
    onClear();
  }, [onClear]);

  return (
    <div className="query-section">
      <div className="query-input-wrapper">
        <input
          type="text"
          className="query-input"
          placeholder="SELECT * FROM data WHERE column = 'value' ORDER BY id"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="query-button"
          onClick={handleExecute}
          disabled={!query.trim()}
        >
          Run
        </button>
        {hasQuery && (
          <button className="clear-button" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>
      {error && <div className="query-error">{error}</div>}
    </div>
  );
}
