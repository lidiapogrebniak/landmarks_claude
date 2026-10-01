import type { Cell } from "../Cell.js";
import type { HexField } from "../HexField.js";
import { GOOD_NEIGHBOR_PENALTY } from "../settings.js";
import type { WeightRule } from "./WeightRule.js";

/** Good locations avoid each other: each neighboring good location lowers the weight. */
export class GoodNeighborPenaltyRule implements WeightRule {
  weightOf(cell: Cell, field: HexField): number {
    const goodNeighborCount = field
      .neighborsOf(cell)
      .filter((neighbor) => neighbor.hasGoodLocation).length;
    return Math.max(0, 1 - goodNeighborCount * GOOD_NEIGHBOR_PENALTY);
  }
}
