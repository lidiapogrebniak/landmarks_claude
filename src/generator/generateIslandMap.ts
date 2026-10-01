import { HexField } from "./HexField.js";
import { IslandMap } from "./IslandMap.js";
import { DistanceFromCenterRule } from "./placement/DistanceFromCenterRule.js";
import { GoodNeighborPenaltyRule } from "./placement/GoodNeighborPenaltyRule.js";
import type { PlacementStage } from "./placement/PlacementStage.js";
import { WeightedPlacementStage } from "./placement/WeightedPlacementStage.js";
import { WordPlacementStage } from "./placement/WordPlacementStage.js";
import { getRandomWords, setSeed } from "./random.js";
import {
  BAD_LOCATION_TYPES,
  DEFAULT_RADIUS,
  GOOD_LOCATION_TYPES,
  LOCATION_COUNTS,
  SEED,
  WORD_COUNT,
} from "./settings.js";
import type { IslandConfig, LandmarkType } from "./types.js";
import {
  validateConfig,
  validateFieldSize,
  validateRadius,
  validateSelectedWord,
  validateUniqueWordCount,
} from "./validation.js";

export interface GenerationOptions {
  radius?: number;
  seed?: number;
}

export function generateIslandMap(
  config: IslandConfig,
  words: readonly string[],
  { radius = DEFAULT_RADIUS, seed = SEED }: GenerationOptions = {},
): IslandMap {
  validateRadius(radius);
  validateConfig(config);
  validateFieldSize(radius, config);

  setSeed(seed);
  const selectedWords = selectWords(words);
  const field = new HexField(radius);
  for (const stage of createPlacementStages(config, selectedWords)) {
    stage.placeOn(field);
  }
  return new IslandMap(field, selectedWords);
}

function selectWords(words: readonly string[]): [string, string, string] {
  const uniqueWords = [...new Set(words)];
  validateUniqueWordCount(uniqueWords);
  const [first = "", second = "", third = ""] = getRandomWords(
    WORD_COUNT,
    uniqueWords,
  );
  const selectedWords: [string, string, string] = [first, second, third];
  selectedWords.forEach(validateSelectedWord);
  return selectedWords;
}

/** The three stages, in the order they must run: words, good locations, bad locations. */
function createPlacementStages(
  config: IslandConfig,
  words: [string, string, string],
): PlacementStage[] {
  return [
    new WordPlacementStage(words),
    new WeightedPlacementStage(
      expandByCount(config, GOOD_LOCATION_TYPES),
      () => new GoodNeighborPenaltyRule(),
    ),
    new WeightedPlacementStage(
      expandByCount(config, BAD_LOCATION_TYPES),
      (field) =>
        new DistanceFromCenterRule(
          DistanceFromCenterRule.centerOf(field.cellsWithGoodLocations()),
        ),
    ),
  ];
}

/** Turns ["WATER", "EXIT"] into ["WATER", "WATER", "WATER", "EXIT"] using the config's counts. */
function expandByCount(
  config: IslandConfig,
  types: readonly LandmarkType[],
): LandmarkType[] {
  return types.flatMap((type) =>
    Array<LandmarkType>(LOCATION_COUNTS[config][type]).fill(type),
  );
}
