import { useState, useCallback } from "react";
import { QueryEditor } from "./QueryEditor";
import { QueryHistory } from "./QueryHistory";
import { useQueryHistory } from "../hooks/useQueryHistory";

interface QueryInputProps {
  onExecute: (sql: string) => void;
  onClear: () => void;
  error: string | null;
  hasQuery: boolean;
  columns: string[];
}

export function QueryInput({
  onExecute,
  onClear,
  error,
  hasQuery,
  columns,
}: QueryInputProps) {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const { history, addToHistory, clearHistory } = useQueryHistory();

  const handleExecute = useCallback(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      addToHistory(trimmedQuery);
      onExecute(trimmedQuery);
    }
  }, [query, onExecute, addToHistory]);

  const handleClear = useCallback(() => {
    setQuery("");
    onClear();
  }, [onClear]);

  const handleHistorySelect = useCallback((selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowHistory(false);
  }, []);

  const toggleHistory = useCallback(() => {
    setShowHistory((prev) => !prev);
  }, []);

  const closeHistory = useCallback(() => {
    setShowHistory(false);
  }, []);

  return (
    <div className="query-section">
      <div className="query-input-wrapper">
        <QueryEditor
          value={query}
          onChange={setQuery}
          onExecute={handleExecute}
          columns={columns}
        />
        <div className="query-buttons">
          <button
            className="query-button"
            onClick={handleExecute}
            disabled={!query.trim()}
            title="Run query (Ctrl/Cmd+Enter)"
          >
            Run
          </button>
          {hasQuery && (
            <button
              className="clear-button"
              onClick={handleClear}
              title="Clear query result"
            >
              Clear
            </button>
          )}
          <div className="history-button-wrapper">
            <button
              className="history-button"
              onClick={toggleHistory}
              title="Query history"
              aria-expanded={showHistory}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M13.507 12.324a7 7 0 0 0 .065-8.56A7 7 0 0 0 2 4.393V2H1v3.5l.5.5H5V5H2.811a6.008 6.008 0 1 1-.135 5.77l-.887.462a7 7 0 0 0 11.718 1.092zm-3.361-.97l.708-.707L8 7.792V4H7v4l.146.354 3 3z" />
              </svg>
            </button>
            {showHistory && (
              <QueryHistory
                history={history}
                onSelect={handleHistorySelect}
                onClose={closeHistory}
                onClear={clearHistory}
              />
            )}
          </div>
        </div>
      </div>
      {error && <div className="query-error">{error}</div>}
    </div>
  );
}
