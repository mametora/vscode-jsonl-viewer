# JSONL Viewer for VSCode

VSCode extension to view JSONL/NDJSON files as interactive tables with SQL-like query support.

![VSCode](https://img.shields.io/badge/VSCode-1.85+-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- 📊 **Table View**: Display JSONL files as formatted tables
- 🔍 **SQL Queries**: Filter and sort data using SQL-like syntax
- ✨ **SQL Editor**: Syntax highlighting and autocomplete with CodeMirror
- 📜 **Query History**: Access previous queries with keyboard navigation
- ⚡ **Virtual Scrolling**: Handle large files (10,000+ rows) smoothly
- 🎨 **VSCode Theme**: Seamlessly integrates with your VSCode theme
- 🔗 **Line Navigation**: Click line numbers to jump to source

## Supported File Types

- `.jsonl` (JSON Lines)
- `.ndjson` (Newline Delimited JSON)

## Usage

1. Open a `.jsonl` or `.ndjson` file in VSCode
2. The file will automatically open in the JSONL Viewer
3. Use the query input to filter and sort data

### Query Examples

```sql
-- Filter by exact value
SELECT * FROM data WHERE status = 'active'

-- Multiple conditions
SELECT * FROM data WHERE age > 30 AND department = 'Engineering'

-- Pattern matching
SELECT * FROM data WHERE name LIKE '%smith%'

-- Sorting
SELECT * FROM data ORDER BY created_at DESC

-- Pagination
SELECT * FROM data LIMIT 100 OFFSET 50

-- Select specific columns
SELECT name, email, status FROM data
```

### Supported SQL Features

| Feature | Syntax |
|---------|--------|
| Select all | `SELECT *` |
| Select columns | `SELECT col1, col2` |
| Where clause | `WHERE col = 'value'` |
| Comparison | `=`, `!=`, `<>`, `>`, `>=`, `<`, `<=` |
| Pattern match | `LIKE '%pattern%'` |
| List match | `IN ('a', 'b', 'c')` |
| Logical | `AND`, `OR`, `NOT` |
| Null check | `IS NULL`, `IS NOT NULL` |
| Order by | `ORDER BY col ASC/DESC` |
| Limit | `LIMIT n` |
| Offset | `OFFSET n` |

> **Note**: The table name in `FROM` clause is ignored. Queries always apply to the current file.

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/mametora/vscode-jsonl-viewer.git
cd vscode-jsonl-viewer

# Install dependencies
npm install
cd webview-ui && npm install && cd ..

# Build
npm run build

# Generate test data (optional)
node scripts/generate-test-data.js 10000

# Package (optional)
npx vsce package
```

### Development

1. Open the project in VSCode
2. Press `F5` to launch the Extension Development Host
3. Open a `.jsonl` file to test

## Screenshots

*Coming soon*

## Known Limitations

- Aggregate functions (COUNT, SUM, AVG, etc.) are not supported
- JOIN operations are not supported
- Subqueries are not supported

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
