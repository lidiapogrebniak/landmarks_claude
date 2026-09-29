Implement the hexagonal field generator based on the architecture you just inspected.

## Goal

Generate a flat-top hexagonal field with radius R = 4.

The complete hexagon contains:

`1 + 3 * R * (R + 1)`

cells, therefore R = 4 produces 61 cells.

Use axial q/r coordinates.

A cell belongs to the hexagon when:

max(abs(q), abs(r), abs(q + r)) <= R

A cell may be empty or contain a Location. The main goal is to distribute certain number of Locations with certain types across the field in a random way but with a certain rules. This field filled with locations is 'a map of an island'.

Generated field filled with locations must be displayed as svg.

## Location types

WORD
WATER
TREASURE
AMULET
TRAP
CURSE
EXIT

`/images` directory contain images to render corresponding location type.

Each 'island map' contain 3 WORD cells, 1 AMULET cell, 1 EXIT cell.

## Field configuration

The generator must support:

- beginner (3 WATER, 3 CURSE, 3 TREASURE, 4 TRAP)
- pro (4 WATER, 5 CURSE, 4 TREASURE, 6 TRAP)

location count configuration. Use radiobutton.

The generator should accept:

- radius(default=4)
- location count configuration

## WORD locations

Exactly 3 of the generated locations must be WORD locations.

Their words must be selected randomly from the existing `wordBank.json` JSON word resource.

Requirements:

- select exactly 3 words;
- all 3 words must be different;
- do not hardcode the words in TypeScript;
- words locations must be adjacent(each cell must have at least one WORD neighbor);
- first two letters of each word must be displayed in cell in hex field;
- three words must be displayed completely below hex field in format: {WORD_A}-{WORD_B}-{WORD_C};
- WORD location can't share same cell with any other type location;

## Image locations

All remaining locations must be image locations.

## Random placement

Choose occupied cells randomly from all cells in the R=4 hexagon.

Then assign the 3 WORD locations and the remaining image locations.

There must never be two locations at the same q/r coordinate.

## Validation

Validate at least:

- radius is valid;
- the word JSON contains at least 3 unique words.

Use clear errors.

## Important

Do not introduce React, Vite, Webpack or another bundler.

Keep the generator independent from DOM rendering.
