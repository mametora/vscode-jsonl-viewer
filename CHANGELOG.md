# Changelog

All notable changes to the "JSONL Viewer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 1.0.0 (2026-02-03)


### Features

* add column resize and tooltip functionality ([46fceb8](https://github.com/mametora/vscode-jsonl-viewer/commit/46fceb84ea777383847d5268b64d4841f29e1ae6))
* add column resize functionality to data table ([177d60a](https://github.com/mametora/vscode-jsonl-viewer/commit/177d60aa34bda0b0f29b411770016350aa6265f8))
* add tooltip for truncated cell content ([2899f06](https://github.com/mametora/vscode-jsonl-viewer/commit/2899f069d9b4f516b5c592bf2b4ef43b278ba96d))
* enhance query input with CodeMirror editor ([4d991a7](https://github.com/mametora/vscode-jsonl-viewer/commit/4d991a7e4ac2f7feb9114d3e6a3600693fecad94))
* implement JSONL viewer extension with SQL query support ([caf4f85](https://github.com/mametora/vscode-jsonl-viewer/commit/caf4f858ea5d5263db8d62d5be86d1b4c2196bfd))


### Bug Fixes

* resolve ESLint errors and warnings ([c7c9985](https://github.com/mametora/vscode-jsonl-viewer/commit/c7c9985448845c72dea92ba48cac3c123aa99bb2))

## [0.0.1] - 2025-02-03

### Added

- Initial release
- View JSONL/NDJSON files as interactive tables
- Virtual scrolling for large files
- SQL-like query support:
  - SELECT with column selection
  - WHERE with conditions (=, !=, <, >, <=, >=, LIKE, IN)
  - ORDER BY (ASC/DESC)
  - LIMIT and OFFSET
- Query history with persistence
- SQL autocomplete with CodeMirror editor
- Go to original line number feature
