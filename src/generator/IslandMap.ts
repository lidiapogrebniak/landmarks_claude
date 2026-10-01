import type { Cell } from "./Cell.js";
import type { HexField } from "./HexField.js";

/** A generated map: the field with its locations and the three words in display order. */
export class IslandMap {
  constructor(
    readonly field: HexField,
    readonly words: [string, string, string],
  ) {}

  get radius(): number {
    return this.field.radius;
  }

  get cells(): Cell[] {
    return this.field.cells;
  }
}
