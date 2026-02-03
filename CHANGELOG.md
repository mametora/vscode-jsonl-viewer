# Changelog

All notable changes to the "JSONL Viewer" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
