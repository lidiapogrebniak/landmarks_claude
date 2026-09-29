# Project Overview

This is a small TypeScript browser project for generating and visualizing
a hexagonal game field.

The project uses:

- TypeScript
- npm
- live-server
- native ES modules
- browser Fetch API
- JSON resources

There is no React, Vite, Webpack or other bundler.

## Project Structure

- `src/` — TypeScript source code
- `dist/` — compiled JavaScript only (generated, not committed)
- `index.html` — browser entry point, loads `./dist/index.js`
- `data/wordBank.json` — word data used by the application
- `images/` - images for different location types

TypeScript source files must stay in `src/`.
Generated JavaScript goes to `dist/`. Do not put hand-written files in `dist/`.

live-server serves the project root, so resource URLs are relative to
`index.html`: `./data/wordBank.json`, `./images/<name>.png`.

## TypeScript

Use strict TypeScript.

Do not use `any` unless there is a strong reason.

Use ES modules.

Do not introduce additional dependencies unless they are necessary
and explicitly justified.

## Hex Grid

The project uses axial coordinates:

- `q`
- `r`

The hex grid uses flat-top orientation.

A cell is identified by:

`q={q}r={r}`

Do not introduce another coordinate system.

## Browser

The application runs in a browser through `live-server`.

Static resources are loaded using normal browser APIs such as `fetch()`.

Do not introduce a bundler or framework.

## Code Style

Keep the implementation simple and readable.

Prefer small functions with one clear responsibility.

Avoid unnecessary abstractions.

Do not refactor unrelated code.

Do not modify project architecture unless required by the task.
