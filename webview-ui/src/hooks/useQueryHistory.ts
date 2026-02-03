import { useState, useCallback, useEffect } from "react";
import { getVsCodeApi } from "./useVscodeApi";

const MAX_HISTORY_SIZE = 50;
const STATE_KEY = "queryHistory";

interface WebviewState {
  [STATE_KEY]?: string[];
}

export function useQueryHistory() {
  const [history, setHistory] = useState<string[]>(() => {
    const state = getVsCodeApi().getState() as WebviewState | null;
    return state?.[STATE_KEY] ?? [];
  });

  // Persist history to VSCode state
  useEffect(() => {
    const currentState = (getVsCodeApi().getState() as WebviewState) ?? {};
    getVsCodeApi().setState({
      ...currentState,
      [STATE_KEY]: history,
    });
  }, [history]);

  const addToHistory = useCallback((query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return;
    }

    setHistory((prev) => {
      // Remove duplicate if exists
      const filtered = prev.filter(
        (q) => q.toLowerCase() !== trimmedQuery.toLowerCase()
      );
      // Add to the beginning
      const newHistory = [trimmedQuery, ...filtered];
      // Limit size
      return newHistory.slice(0, MAX_HISTORY_SIZE);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const removeFromHistory = useCallback((index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
