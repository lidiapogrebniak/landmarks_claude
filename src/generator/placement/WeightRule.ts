import type { Cell } from "../Cell.js";
import type { HexField } from "../HexField.js";

/** Says how likely a free cell is to receive the next location. */
export interface WeightRule {
  weightOf(cell: Cell, field: HexField): number;
}
