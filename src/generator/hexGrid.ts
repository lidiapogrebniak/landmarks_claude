import type { HexCoord } from "./types.js";

const NEIGHBOR_OFFSETS: HexCoord[] = [
  { q: 1, r: 0 },
  { q: -1, r: 0 },
  { q: 0, r: 1 },
  { q: 0, r: -1 },
  { q: 1, r: -1 },
  { q: -1, r: 1 },
];

export function getCellId(cell: HexCoord): string {
  return `q=${cell.q}r=${cell.r}`;
}

export function getCellCount(radius: number): number {
  return 1 + 3 * radius * (radius + 1);
}

export function isInField(cell: HexCoord, radius: number): boolean {
  return Math.max(Math.abs(cell.q), Math.abs(cell.r), Math.abs(cell.q + cell.r)) <= radius;
}

export function getFieldCells(radius: number): HexCoord[] {
  const cells: HexCoord[] = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (isInField({ q, r }, radius)) {
        cells.push({ q, r });
      }
    }
  }
  return cells;
}

export function getNeighborsInField(cell: HexCoord, radius: number): HexCoord[] {
  return NEIGHBOR_OFFSETS.map((offset) => ({ q: cell.q + offset.q, r: cell.r + offset.r })).filter(
    (neighbor) => isInField(neighbor, radius),
  );
}

export function areNeighbors(a: HexCoord, b: HexCoord): boolean {
  return getDistance(a, b) === 1;
}

export function getDistance(a: HexCoord, b: HexCoord): number {
  const dq = a.q - b.q;
  const dr = a.r - b.r;
  return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
}

/** Rounds fractional axial coordinates to the nearest hex cell (cube rounding). */
export function roundToHex(q: number, r: number): HexCoord {
  const s = -q - r;
  let roundedQ = Math.round(q);
  let roundedR = Math.round(r);
  const roundedS = Math.round(s);

  const qDiff = Math.abs(roundedQ - q);
  const rDiff = Math.abs(roundedR - r);
  const sDiff = Math.abs(roundedS - s);

  if (qDiff > rDiff && qDiff > sDiff) {
    roundedQ = -roundedR - roundedS;
  } else if (rDiff > sDiff) {
    roundedR = -roundedQ - roundedS;
  }
  // Avoid -0 in coordinates.
  return { q: roundedQ + 0, r: roundedR + 0 };
}
