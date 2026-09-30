export type IslandConfig = "beginner" | "pro";

export type LocationType =
  | "WORD"
  | "WATER"
  | "TREASURE"
  | "AMULET"
  | "TRAP"
  | "CURSE"
  | "EXIT";

export interface HexCoord {
  q: number;
  r: number;
}

export interface Location {
  type: LocationType;
  word?: string; // only for WORD
}

export interface Cell extends HexCoord {
  location: Location | null;
}

export interface IslandMap {
  radius: number;
  cells: Cell[]; // all cells of the hexagon, including empty ones
  words: [string, string, string]; // in display order
}
