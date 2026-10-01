export type IslandConfig = "beginner" | "pro";

export type LocationType =
  | "WORD"
  | "WATER"
  | "TREASURE"
  | "AMULET"
  | "TRAP"
  | "CURSE"
  | "EXIT";

/** Location types placed by weighted stages, i.e. everything except WORD. */
export type LandmarkType = Exclude<LocationType, "WORD">;
