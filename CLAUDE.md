# VSCode JSONL Viewer

A VSCode extension to view JSONL/NDJSON files as interactive tables with SQL-like query support.

## Project Structure

```
vscode-jsonl-viewer/
├── src/                          # Extension (Node.js)
│   ├── extension.ts              # Entry point
│   ├── jsonlEditorProvider.ts    # Custom Editor Provider
│   ├── jsonlDocument.ts          # JSONL parsing
│   ├── queryEngine/
│   │   ├── index.ts
│   │   ├── parser.ts             # SQL parsing (node-sql-parser)
│   │   ├── executor.ts           # Query execution
│   │   └── types.ts              # Type definitions
│   └── __tests__/                # Unit tests
│       ├── jsonlDocument.test.ts
│       └── queryEngine/
│           ├── parser.test.ts
│           └── executor.test.ts
├── webview-ui/                   # Webview (React + Vite)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── DataTable.tsx     # Virtual scroll table
│   │   │   ├── QueryInput.tsx    # Query input container
│   │   │   ├── QueryEditor.tsx   # CodeMirror SQL editor
│   │   │   ├── QueryHistory.tsx  # Query history dropdown
│   │   │   └── StatusBar.tsx
│   │   ├── hooks/
│   │   │   ├── useVscodeApi.ts   # VSCode API communication
│   │   │   └── useQueryHistory.ts # Query history management
│   │   └── utils/
│   │       ├── codemirrorTheme.ts # CodeMirror theme
│   │       └── sqlCompletions.ts  # SQL autocomplete
│   ├── package.json
│   └── vite.config.ts
├── test-data/                    # Test data
├── package.json
├── tsconfig.json
├── vitest.config.ts              # Test configuration
└── esbuild.js
```

## Development Commands

```bash
# Install dependencies
npm install
cd webview-ui && npm install

# Build (all)
npm run build

# Build extension only
npm run build:extension

# Build webview only
npm run build:webview

# Watch mode for extension
npm run watch

# Dev mode for webview (with hot reload)
npm run dev:webview

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Generate test data (10,000 rows)
node scripts/generate-test-data.js 10000
```

## Debugging

1. Press `F5` in VSCode to launch Extension Development Host
2. Open a `.jsonl` or `.ndjson` file

## Tech Stack

- **Extension**: TypeScript, esbuild, node-sql-parser, Vitest
- **Webview**: React, Vite, @tanstack/react-virtual, CodeMirror

## VSCode-Webview Communication

| Message Type | Direction | Description |
|-------------|-----------|-------------|
| `ready` | Webview → Extension | Webview initialized |
| `update` | Extension → Webview | Send JSONL data |
| `query` | Webview → Extension | Execute SQL query |
| `queryResult` | Extension → Webview | Query result |
| `queryError` | Extension → Webview | Query error |
| `goToLine` | Webview → Extension | Jump to line number |

## Supported SQL Queries

```sql
SELECT * FROM data
SELECT column1, column2 FROM data
SELECT * FROM data WHERE column = 'value'
SELECT * FROM data WHERE column > 10 AND other = 'x'
SELECT * FROM data WHERE column LIKE '%pattern%'
SELECT * FROM data WHERE column IN ('a', 'b', 'c')
SELECT * FROM data ORDER BY column ASC
SELECT * FROM data ORDER BY column DESC
SELECT * FROM data LIMIT 100
SELECT * FROM data LIMIT 100 OFFSET 50
```

## Notes

- Table name in `FROM` clause is ignored (always targets current file)
- Aggregate functions (COUNT, SUM, etc.) are not supported
- JOIN is not supported
