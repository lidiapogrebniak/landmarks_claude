import type { IslandConfig, LocationType } from "./types.js";

export const DEFAULT_RADIUS = 4;

/** Weight removed from a free cell for each neighboring good location. */
export const GOOD_NEIGHBOR_PENALTY = 0.2;

/** How fast the chance of a bad location falls with distance from the center; larger means flatter. */
export const DISTANCE_DECAY_FACTOR = 2;

export const WORD_COUNT = 3;

/** Placement order of good locations after the WORD cells. */
export const GOOD_LOCATION_ORDER = ["WATER", "TREASURE", "AMULET", "EXIT"] as const;

/** Placement order of bad locations. */
export const BAD_LOCATION_ORDER = ["CURSE", "TRAP"] as const;

type PlacedLocationType =
  | (typeof GOOD_LOCATION_ORDER)[number]
  | (typeof BAD_LOCATION_ORDER)[number];

export const LOCATION_COUNTS: Record<IslandConfig, Record<PlacedLocationType, number>> = {
  beginner: { WATER: 3, TREASURE: 3, AMULET: 1, EXIT: 1, CURSE: 3, TRAP: 4 },
  pro: { WATER: 4, TREASURE: 4, AMULET: 1, EXIT: 1, CURSE: 5, TRAP: 6 },
};

export const CONFIGS = Object.keys(LOCATION_COUNTS) as IslandConfig[];

export function getTotalLocationCount(config: IslandConfig): number {
  const counts = Object.values(LOCATION_COUNTS[config]);
  return WORD_COUNT + counts.reduce((sum, count) => sum + count, 0);
}

export function getLocationCount(config: IslandConfig, type: LocationType): number {
  return type === "WORD" ? WORD_COUNT : LOCATION_COUNTS[config][type];
}
