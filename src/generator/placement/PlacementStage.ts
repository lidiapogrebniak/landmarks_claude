import type { HexField } from "../HexField.js";

/** One step of map generation that places a group of locations on the field. */
export interface PlacementStage {
  placeOn(field: HexField): void;
}
