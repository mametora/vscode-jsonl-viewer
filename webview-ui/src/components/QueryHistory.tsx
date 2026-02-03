import { useCallback, useEffect, useRef } from "react";

interface QueryHistoryProps {
  history: string[];
  onSelect: (query: string) => void;
  onClose: () => void;
  onClear: () => void;
}

export function QueryHistory({
  history,
  onSelect,
  onClose,
  onClear,
}: QueryHistoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = useCallback(
    (query: string) => {
      onSelect(query);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClear();
    },
    [onClear]
  );

  if (history.length === 0) {
    return (
      <div ref={containerRef} className="query-history-dropdown">
        <div className="query-history-empty">No query history</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="query-history-dropdown">
      <div className="query-history-header">
        <span>Recent Queries</span>
        <button className="query-history-clear" onClick={handleClear}>
          Clear
        </button>
      </div>
      <ul className="query-history-list">
        {history.map((query, index) => (
          <li
            key={index}
            className="query-history-item"
            onClick={() => handleSelect(query)}
            title={query}
          >
            <span className="query-history-text">{query}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
