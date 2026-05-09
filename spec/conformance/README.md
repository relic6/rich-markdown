# Rich Markdown Conformance Fixtures

This directory contains parser-level conformance fixtures.

Each case is a directory with:

- `input.rmd`: source document
- `expected.json`: expected AST

Run:

```bash
npm run conformance
```

The runner parses each `input.rmd`, validates the AST, and compares it with
`expected.json`.
