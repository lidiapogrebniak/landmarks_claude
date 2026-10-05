import { BAD_LOCATION_TYPES } from "./settings.js";
import type { LandmarkType, LocationType } from "./types.js";

/** Something placed on a cell: a word or a landmark such as water or a trap. */
export class Location {
  private constructor(
    readonly type: LocationType,
    readonly word: string | null,
  ) {}

  static ofWord(word: string): Location {
    return new Location("WORD", word);
  }

  static ofType(type: LandmarkType): Location {
    return new Location(type, null);
  }

  get isGood(): boolean {
    return !(BAD_LOCATION_TYPES as LocationType[]).includes(this.type);
  }
}
