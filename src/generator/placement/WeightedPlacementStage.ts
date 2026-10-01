import type { HexField } from "../HexField.js";
import { Location } from "../Location.js";
import { pickWeighted } from "../random.js";
import type { LandmarkType } from "../types.js";
import type { PlacementStage } from "./PlacementStage.js";
import type { WeightRule } from "./WeightRule.js";

/**
 * Places locations one at a time, in the given order, each on a free cell
 * picked with probability proportional to the weight rule.
 * The rule is created once, when the stage starts.
 */
export class WeightedPlacementStage implements PlacementStage {
  constructor(
    private readonly locationTypes: LandmarkType[],
    private readonly createWeightRule: (field: HexField) => WeightRule,
  ) {}

  placeOn(field: HexField): void {
    const weightRule = this.createWeightRule(field);
    for (const type of this.locationTypes) {
      const cell = pickWeighted(field.freeCells(), (candidate) =>
        weightRule.weightOf(candidate, field),
      );
      cell.place(Location.ofType(type));
    }
  }
}
