import { getCellId, getFieldCells } from "./hexGrid.js";
import { placeBadLocations, placeGoodLocations, placeWords, pickWordCells, type Placements } from "./placement.js";
import { pickDistinct } from "./random.js";
import { DEFAULT_RADIUS, WORD_COUNT } from "./settings.js";
import type { Cell, HexCoord, IslandConfig, IslandMap } from "./types.js";
import {
  validateConfig,
  validateFieldSize,
  validateRadius,
  validateSelectedWord,
  validateUniqueWordCount,
} from "./validation.js";

export function generateIslandMap(
  config: IslandConfig,
  words: readonly string[],
  radius: number = DEFAULT_RADIUS,
): IslandMap {
  validateRadius(radius);
  validateConfig(config);
  validateFieldSize(radius, config);
  const selectedWords = selectWords(words);

  const fieldCells = getFieldCells(radius);
  const placements: Placements = new Map();
  placeWords(placements, pickWordCells(fieldCells, radius), selectedWords);
  placeGoodLocations(placements, fieldCells, config);
  placeBadLocations(placements, fieldCells, config);

  return {
    radius,
    cells: buildCells(fieldCells, placements),
    words: selectedWords,
  };
}

function selectWords(words: readonly string[]): [string, string, string] {
  const uniqueWords = [...new Set(words)];
  validateUniqueWordCount(uniqueWords);
  const [first, second, third] = pickDistinct(uniqueWords, WORD_COUNT) as [string, string, string];
  [first, second, third].forEach(validateSelectedWord);
  return [first, second, third];
}

function buildCells(fieldCells: readonly HexCoord[], placements: Placements): Cell[] {
  return fieldCells.map((cell) => ({
    q: cell.q,
    r: cell.r,
    location: placements.get(getCellId(cell))?.location ?? null,
  }));
}
