# Hex island map generator

Implement the hex island map generator and its viewer as described below.

## Git workflow

Before changing any files, create a new feature branch from `main` and do all work on it. Never commit to `main` directly.

## What to build

Two separate parts:

1. **Generator**: a pure TypeScript module that produces an island map as data. It knows nothing about the DOM, SVG or the page.
2. **Viewer**: a single page `index.html` that lets the user pick a configuration, press a button and see the generated map as SVG.

The generator must be usable and testable without the viewer.

## Use the existing project setup

Before writing code, inspect the existing project and build on what is already there:

- `package.json`: its scripts (build, start/live-server) and dependencies;
- `tsconfig.json`: output directory, module format, target;
- the folder layout: where source `.ts` files live, where compiled `.js` goes, where `index.html` is expected;
- `wordBank.json` (its exact format) and the files in `/images`.

Rules:

- Put new files where the existing layout says they belong, and compile them with the existing build script.
- Do not install new dependencies, and do not add or change config files (`package.json`, `tsconfig.json`, etc.) unless the task cannot be done otherwise.

## Code structure

Optimize for a human reader, not for performance. The code should be easy to read, easy to understand and pleasant to change. You may sacrifice performance and efficiency significantly for that: recomputing things, extra objects, extra passes over the field are all fine.

- Use OOP where it makes the domain clearer: model the main concepts as classes with clear responsibilities (for example the field, a cell, a location, the placement stages, the map renderer).
- Introduce abstractions where they make the code simpler to follow, for example a common interface for placement stages or for weight rules. Do not add abstractions that have only one trivial use and add no clarity.
- Each class, file and method has one clear responsibility. Names say what things do; no abbreviations.
- There is no limit on the number of files. Aim for an architecture that is simple, consistent and easy to explain in a few sentences.
- The types and function names in this spec are examples; choose the class design and file split yourself.

## Part 1. Generator

### Input

- `radius`: integer, default `3`.
- `config`: `"beginner"` or `"pro"`.
- `words`: list of words loaded from `wordBank.json` (the generator receives them as a parameter; it does not read files itself).

### Output

A data object, for example (a plain object is not mandatory; class instances are fine):

```ts
type LocationType =
  | "WORD"
  | "WATER"
  | "TREASURE"
  | "AMULET"
  | "TRAP"
  | "CURSE"
  | "EXIT";

interface Cell {
  q: number;
  r: number;
  location: null | { type: LocationType; word?: string }; // word only for WORD
}

interface IslandMap {
  radius: number;
  cells: Cell[]; // all cells of the hexagon, including empty ones
  words: [string, string, string]; // in display order
}
```

Adjust names and shape to the project's conventions if needed, but keep the idea: every cell of the field is present, empty cells have no location.

### Field

- Flat-top hexagon, axial coordinates `q`, `r`.
- A cell belongs to the field when `max(|q|, |r|, |q + r|) <= radius`.
- Cell count is `1 + 3 * radius * (radius + 1)`; for radius 3 that is 37.
- Neighbors of `(q, r)`: `(q+1, r)`, `(q-1, r)`, `(q, r+1)`, `(q, r-1)`, `(q+1, r-1)`, `(q-1, r+1)`.

### Location counts

Always present, in every configuration:

| Type   | Count |
| ------ | ----- |
| WORD   | 3     |
| AMULET | 1     |
| EXIT   | 1     |

Depends on configuration:

| Type                              | beginner | pro    |
| --------------------------------- | -------- | ------ |
| WATER                             | 3        | 4      |
| CURSE                             | 3        | 5      |
| TREASURE                          | 3        | 4      |
| TRAP                              | 4        | 6      |
| **Total locations (incl. fixed)** | **18**   | **24** |

Keep these counts in one configuration object, not scattered through the code.

### Placement rules

- One cell holds at most one location. No two locations share a `q/r` coordinate.
- The 3 WORD cells form one connected group: each WORD cell has at least one other WORD cell among its neighbors (a chain of 3 or a triangle).
- All other locations are placed with weighted randomness (see below).
- The rest of the cells stay empty.

### Location groups

Good: WORD, WATER, TREASURE, AMULET, EXIT.
Bad: CURSE, TRAP.

### Algorithm

Placement goes in three stages, strictly in this order: WORD cells, then the other good locations, then bad locations. Locations are placed one at a time. Occupied cells can never be chosen.

All randomness comes from one seeded generator module (mulberry32). Never call `Math.random` anywhere in the generator: every random choice (stage 1, `pickWeighted`, word selection) uses this `random()`:

```ts
let seed = 0;

export function setSeed(value: number): void {
  seed = value | 0;
}

/** Seeded pseudo-random number in [0, 1) (mulberry32). */
export default function random(): number {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
```

The seed is static for testing: `setSeed` is called before each map generation, so the same seed always gives the same map (with the default `SEED`, every press of Generate shows the same map for a given configuration). The generator accepts an optional seed (default `SEED`) and calls `setSeed` with it at the start of every generation.

**Stage 1. WORD cells**

1. Pick cell A uniformly at random among all cells of the field.
2. Pick cell B uniformly at random among the neighbors of A that are inside the field.
3. Build a candidate list: the in-field neighbors of A followed by the in-field neighbors of B, keeping duplicates, then remove A and B from it. Pick cell C uniformly from this list. Cells adjacent to both A and B appear twice, so they are twice as likely to be chosen (this is intended).

**Stage 2. Good locations (WATER, TREASURE, AMULET, EXIT)**

Place them one at a time, in a fixed order of types: all WATER, then all TREASURE, then AMULET, then EXIT. Do not shuffle the order of types. Before each placement, compute the weight of every free cell:

- start with weight `1`;
- for every already placed good location (WORD cells included) that is a neighbor of this cell, subtract `GOOD_NEIGHBOR_PENALTY`;
- penalties add up; the weight never goes below `0`.

Pick a free cell with probability proportional to its weight. If all free cells have weight `0`, pick uniformly among free cells. Recalculate weights after every placement.

**Stage 3. Bad locations (CURSE, TRAP)**

1. Compute the center once: average `q` and average `r` over all good locations, WORD cells included. Round it to the nearest hex cell (cube rounding); this is `centerCell`. It does not change during this stage.
2. Place bad locations one at a time, in a fixed order of types: all CURSE, then all TRAP. Do not shuffle the order of types. The weight of a free cell is:

   ```ts
   Math.exp(-getDistance(cell, centerCell) / DISTANCE_DECAY_FACTOR);
   ```

   where `getDistance` is the hex distance in axial coordinates: `(|dq| + |dr| + |dq + dr|) / 2`.

3. Pick a free cell with probability proportional to its weight.

Bad locations may be placed next to good locations and next to the center.

### Tuning constants

Keep these together in one place, next to the location counts, so they are easy to tune:

| Constant                | Default | Meaning                                                                                         |
| ----------------------- | ------- | ----------------------------------------------------------------------------------------------- |
| `GOOD_NEIGHBOR_PENALTY` | `0.2`   | Weight removed from a free cell for each neighboring good location                              |
| `DISTANCE_DECAY_FACTOR` | `2`     | How fast the chance of a bad location falls with distance from the center; larger means flatter |
| `SEED`                  | `12345` | Seed for the random generator, set before each map generation                                   |

Implement weighted choice as one reusable helper (e.g. `pickWeighted(cells, weightFn)`) used by stages 2 and 3.

### Words

- Pick 3 different words using this function
  export function getRandomWords(
  count: number,
  words: readonly string[],
  ): string[] {
  const shuffledWords = [...words].sort(() => 0.5 - random());
  return shuffledWords.slice(0, count);
  }
- Never hardcode words in the code.
- The order of the 3 words is the display order `{WORD_A}-{WORD_B}-{WORD_C}`.
- Words map to WORD cells by that order: the first word goes to cell A, the second to cell B, the third to cell C (see Stage 1).
- Use words exactly as they appear in `wordBank.json` (lowercase). Do not change their case, neither in cells nor in the word line.

### Validation

Throw clear, specific errors (say what is wrong and what value was received) when:

- `radius` is not an integer or is less than 1;
- the field is too small for the configuration (cell count < total locations);
- `config` is not `beginner` or `pro`;
- the word list has fewer than 3 unique words;
- a selected word is shorter than 2 letters (it can't be shown as two letters in a cell).

## Part 2. Viewer (index.html)

### Layout, top to bottom

1. Two radio buttons: **Beginner** (`beginner`, selected by default) and **Pro** (`pro`).
2. A **Generate** button.
3. The SVG with the generated map.
4. Below the SVG, the three words in full: `{WORD_A}-{WORD_B}-{WORD_C}`.

On page load, generate a beginner map once so the page is not empty. Each press of Generate produces a new map with the selected configuration. The radius is not exposed in the UI; the viewer uses the default (3).

### Rendering

- Draw every cell of the field as a flat-top hexagon outline, including empty ones.
- Axial to pixel for flat-top, with hex size `s`: `x = s * 3/2 * q`, `y = s * sqrt(3) * (r + q/2)`. Center the field in the SVG.
- WORD cell: show the first two letters of its word as text in the cell.
- Other location cells: show the image from `/images` for that type. Build the type → file mapping from the actual file names in `/images`; if a type has no matching image, stop and ask.
- If generation throws, show the error message on the page instead of the map.
- Errors while loading data (failed `fetch`, `wordBank.json` in an unexpected shape) go to the console only (`console.error`), not on the page. Only generation errors are shown on the page.

## Constraints

- No React, Vite, Webpack or any other bundler or framework.
- The generator module must not import or touch DOM APIs.
- Words are loaded from wordBank.json at runtime (e.g. with fetch) by the viewer and passed to the generator.
- The project already uses live-server to serve the page, which is what makes wordBank.json reachable via fetch. Use it as is: do not add another server or dev tool, and do not work around fetch (e.g. by inlining the JSON). Check package.json for how it is started and keep paths relative to what live-server serves.
- If TypeScript must be compiled for the browser, use plain `tsc` output (ES modules) loaded with `<script type="module">`, not a bundler.

## Done when

Do not add test files or a test framework to the project. Instead, verify the generator yourself before reporting:

- Write a throwaway check script outside the project (or delete it afterwards), run the generator at least 100 times (you can use random seed during this step) for each configuration, and check on every run:
  - total cell count is 1 + 3R(R+1);
  - every cell satisfies the field condition, no duplicate coordinates;
  - exact count of each location type;
  - 3 different WORD words, and the WORD cells are connected;
- Run the generator twice with the same seed and confirm the two maps are identical.
- Call the generator once for each validation case and confirm it throws the expected error.
- If any check fails, fix the generator and run the checks again. Do not report the task as done while a check fails.
- Make sure no check files are left in the project.
- After all checks pass, commit the work on your feature branch. Stage only the files you created or changed for this task. Do not include `.claude/commands/landmarks.md` in the commit: it contains the user's own edits.
- Push the branch and open a pull request into `main`. In the PR description, include: a short summary of what was built, the file structure, and the results of the checks (number of runs, which rules were verified, anything fixed along the way). Do not merge it.

## Then report to the user:

- which files were created or changed;
- the result of the checks (how many runs, all rules passed, or what was fixed along the way);
- how to open the page with live-server.
