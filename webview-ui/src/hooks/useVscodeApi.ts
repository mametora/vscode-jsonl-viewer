import { useCallback, useEffect, useState } from "react";

interface VsCodeApi {
  postMessage(message: unknown): void;
  getState(): unknown;
  setState(state: unknown): void;
}

declare function acquireVsCodeApi(): VsCodeApi;

let vscodeApi: VsCodeApi | null = null;

export function getVsCodeApi(): VsCodeApi {
  if (!vscodeApi) {
    vscodeApi = acquireVsCodeApi();
  }
  return vscodeApi;
}

export interface JsonlRow {
  _lineNumber: number;
  _raw: string;
  _parseError?: string;
  [key: string]: unknown;
}

export interface JsonlData {
  rows: JsonlRow[];
  columns: string[];
  errors: { line: number; message: string }[];
}

export interface QueryResult {
  rows: JsonlRow[];
  columns: string[];
  totalCount: number;
  filteredCount: number;
}

type MessageHandler = (message: {
  type: string;
  data?: JsonlData;
  result?: QueryResult;
  error?: string;
}) => void;

export function useVscodeMessages(handler: MessageHandler) {
  useEffect(() => {
    const messageHandler = (event: MessageEvent) => {
      handler(event.data);
    };

    window.addEventListener("message", messageHandler);
    return () => window.removeEventListener("message", messageHandler);
  }, [handler]);
}

export function useJsonlData() {
  const [data, setData] = useState<JsonlData | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleMessage = useCallback(
    (message: {
      type: string;
      data?: JsonlData;
      result?: QueryResult;
      error?: string;
    }) => {
      switch (message.type) {
        case "update":
          if (message.data) {
            setData(message.data);
            setQueryResult(null);
            setQueryError(null);
          }
          setIsLoading(false);
          break;
        case "queryResult":
          if (message.result) {
            setQueryResult(message.result);
            setQueryError(null);
          }
          break;
        case "queryError":
          setQueryError(message.error || "Unknown error");
          break;
      }
    },
    []
  );

  useVscodeMessages(handleMessage);

  useEffect(() => {
    getVsCodeApi().postMessage({ type: "ready" });
  }, []);

  const executeQuery = useCallback((sql: string) => {
    setQueryError(null);
    getVsCodeApi().postMessage({ type: "query", sql });
  }, []);

  const clearQuery = useCallback(() => {
    setQueryResult(null);
    setQueryError(null);
  }, []);

  const goToLine = useCallback((line: number) => {
    getVsCodeApi().postMessage({ type: "goToLine", line });
  }, []);

  return {
    data,
    queryResult,
    queryError,
    isLoading,
    executeQuery,
    clearQuery,
    goToLine,
  };
}
