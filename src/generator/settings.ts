import type { IslandConfig, LandmarkType, LocationType } from "./types.js";

export const DEFAULT_RADIUS = 3;

/** Seed for the random generator, set before each map generation. */
export const SEED = 12345;

/** Weight removed from a free cell for each neighboring good location. */
export const GOOD_NEIGHBOR_PENALTY = 0.2;

/** How fast the chance of a bad location falls with distance from the center; larger means flatter. */
export const DISTANCE_DECAY_FACTOR = 2;

export const WORD_COUNT = 3;

/** Good locations placed after the WORD cells, in placement order. */
export const GOOD_LOCATION_TYPES: LandmarkType[] = [
  "WATER",
  "TREASURE",
  "AMULET",
  "EXIT",
];

/** Bad locations, in placement order. */
export const BAD_LOCATION_TYPES: LandmarkType[] = ["CURSE", "TRAP"];

/** How many locations of each type a map has. */
export const LOCATION_COUNTS: Record<
  IslandConfig,
  Record<LocationType, number>
> = {
  beginner: {
    WORD: WORD_COUNT,
    WATER: 3,
    TREASURE: 3,
    AMULET: 1,
    EXIT: 1,
    CURSE: 3,
    TRAP: 4,
  },
  pro: {
    WORD: WORD_COUNT,
    WATER: 4,
    TREASURE: 4,
    AMULET: 1,
    EXIT: 1,
    CURSE: 5,
    TRAP: 6,
  },
};

export const CONFIGS = Object.keys(LOCATION_COUNTS) as IslandConfig[];

export function getTotalLocationCount(config: IslandConfig): number {
  return Object.values(LOCATION_COUNTS[config]).reduce(
    (sum, count) => sum + count,
    0,
  );
}
