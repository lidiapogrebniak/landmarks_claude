import { areNeighbors, getCellId, getDistance, getNeighborsInField, roundToHex } from "./hexGrid.js";
import { pickRandom, pickWeighted } from "./random.js";
import {
  BAD_LOCATION_ORDER,
  DISTANCE_DECAY_FACTOR,
  GOOD_LOCATION_ORDER,
  GOOD_NEIGHBOR_PENALTY,
  LOCATION_COUNTS,
} from "./settings.js";
import type { HexCoord, IslandConfig, Location, LocationType } from "./types.js";

/** Locations placed so far, keyed by cell id. */
export type Placements = Map<string, { cell: HexCoord; location: Location }>;

type WordCells = [HexCoord, HexCoord, HexCoord];

/** Stage 1: picks three connected cells A, B, C for the WORD locations. */
export function pickWordCells(fieldCells: readonly HexCoord[], radius: number): WordCells {
  const a = pickRandom(fieldCells);
  const neighborsOfA = getNeighborsInField(a, radius);
  const b = pickRandom(neighborsOfA);

  const idsOfAB = [getCellId(a), getCellId(b)];
  const candidates = [...neighborsOfA, ...getNeighborsInField(b, radius)].filter(
    (cell) => !idsOfAB.includes(getCellId(cell)),
  );
  const c = pickRandom(candidates);

  return [a, b, c];
}

export function placeWords(placements: Placements, cells: WordCells, words: readonly string[]): void {
  cells.forEach((cell, index) => {
    placeLocation(placements, cell, { type: "WORD", word: words[index] ?? "" });
  });
}

/** Stage 2: places WATER, TREASURE, AMULET, EXIT away from other good locations. */
export function placeGoodLocations(
  placements: Placements,
  fieldCells: readonly HexCoord[],
  config: IslandConfig,
): void {
  for (const type of GOOD_LOCATION_ORDER) {
    for (let i = 0; i < LOCATION_COUNTS[config][type]; i++) {
      const goodCells = getCellsOfGroup(placements, isGoodLocation);
      const cell = pickWeighted(getFreeCells(placements, fieldCells), (candidate) =>
        getGoodLocationWeight(candidate, goodCells),
      );
      placeLocation(placements, cell, { type });
    }
  }
}

/** Stage 3: places CURSE and TRAP, more likely near the center of good locations. */
export function placeBadLocations(
  placements: Placements,
  fieldCells: readonly HexCoord[],
  config: IslandConfig,
): void {
  const centerCell = getCenterCell(getCellsOfGroup(placements, isGoodLocation));
  for (const type of BAD_LOCATION_ORDER) {
    for (let i = 0; i < LOCATION_COUNTS[config][type]; i++) {
      const cell = pickWeighted(getFreeCells(placements, fieldCells), (candidate) =>
        getBadLocationWeight(candidate, centerCell),
      );
      placeLocation(placements, cell, { type });
    }
  }
}

function getGoodLocationWeight(cell: HexCoord, goodCells: readonly HexCoord[]): number {
  const goodNeighborCount = goodCells.filter((good) => areNeighbors(cell, good)).length;
  return Math.max(0, 1 - goodNeighborCount * GOOD_NEIGHBOR_PENALTY);
}

function getBadLocationWeight(cell: HexCoord, centerCell: HexCoord): number {
  return Math.exp(-getDistance(cell, centerCell) / DISTANCE_DECAY_FACTOR);
}

function getCenterCell(cells: readonly HexCoord[]): HexCoord {
  const averageQ = cells.reduce((sum, cell) => sum + cell.q, 0) / cells.length;
  const averageR = cells.reduce((sum, cell) => sum + cell.r, 0) / cells.length;
  return roundToHex(averageQ, averageR);
}

function isGoodLocation(type: LocationType): boolean {
  return type !== "CURSE" && type !== "TRAP";
}

function getCellsOfGroup(
  placements: Placements,
  isInGroup: (type: LocationType) => boolean,
): HexCoord[] {
  return [...placements.values()]
    .filter((placement) => isInGroup(placement.location.type))
    .map((placement) => placement.cell);
}

function getFreeCells(placements: Placements, fieldCells: readonly HexCoord[]): HexCoord[] {
  return fieldCells.filter((cell) => !placements.has(getCellId(cell)));
}

function placeLocation(placements: Placements, cell: HexCoord, location: Location): void {
  const id = getCellId(cell);
  if (placements.has(id)) {
    throw new Error(`Cell ${id} is already occupied.`);
  }
  placements.set(id, { cell, location });
}
