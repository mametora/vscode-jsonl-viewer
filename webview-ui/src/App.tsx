import { useJsonlData } from "./hooks/useVscodeApi";
import { QueryInput } from "./components/QueryInput";
import { DataTable } from "./components/DataTable";
import { StatusBar } from "./components/StatusBar";

function App() {
  const {
    data,
    queryResult,
    queryError,
    isLoading,
    executeQuery,
    clearQuery,
    goToLine,
  } = useJsonlData();

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-container">
        <div className="empty-state">
          <span>No data available</span>
        </div>
      </div>
    );
  }

  const displayRows = queryResult ? queryResult.rows : data.rows;
  const displayColumns = queryResult ? queryResult.columns : data.columns;
  const isFiltered = queryResult !== null;

  return (
    <div className="app-container">
      <QueryInput
        onExecute={executeQuery}
        onClear={clearQuery}
        error={queryError}
        hasQuery={isFiltered}
      />
      <div className="table-section">
        <DataTable
          rows={displayRows}
          columns={displayColumns}
          onLineClick={goToLine}
        />
      </div>
      <StatusBar
        totalRows={queryResult?.totalCount ?? data.rows.length}
        filteredRows={queryResult?.filteredCount ?? null}
        columns={displayColumns.length}
        errors={data.errors.length}
        isFiltered={isFiltered}
      />
    </div>
  );
}

export default App;
