import type { Cell } from "../Cell.js";
import { HexCoordinate } from "../HexCoordinate.js";
import { DISTANCE_DECAY_FACTOR } from "../settings.js";
import type { WeightRule } from "./WeightRule.js";

/** Bad locations gather around a center: the weight falls with distance from it. */
export class DistanceFromCenterRule implements WeightRule {
  constructor(private readonly center: HexCoordinate) {}

  /** The hex cell nearest to the average position of the given cells. */
  static centerOf(cells: readonly Cell[]): HexCoordinate {
    const averageQ =
      cells.reduce((sum, cell) => sum + cell.coordinate.q, 0) / cells.length;
    const averageR =
      cells.reduce((sum, cell) => sum + cell.coordinate.r, 0) / cells.length;
    return HexCoordinate.round(averageQ, averageR);
  }

  weightOf(cell: Cell): number {
    return Math.exp(
      -cell.coordinate.distanceTo(this.center) / DISTANCE_DECAY_FACTOR,
    );
  }
}
