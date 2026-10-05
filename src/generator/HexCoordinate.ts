/** A position on the flat-top hex grid in axial coordinates. */
export class HexCoordinate {
  private static readonly NEIGHBOR_OFFSETS = [
    new HexCoordinate(1, 0),
    new HexCoordinate(-1, 0),
    new HexCoordinate(0, 1),
    new HexCoordinate(0, -1),
    new HexCoordinate(1, -1),
    new HexCoordinate(-1, 1),
  ];

  constructor(
    readonly q: number,
    readonly r: number,
  ) {}

  /** Rounds fractional axial coordinates to the nearest hex cell (cube rounding). */
  static round(q: number, r: number): HexCoordinate {
    const s = -q - r;
    let roundedQ = Math.round(q);
    let roundedR = Math.round(r);
    const roundedS = Math.round(s);

    const qDifference = Math.abs(roundedQ - q);
    const rDifference = Math.abs(roundedR - r);
    const sDifference = Math.abs(roundedS - s);

    if (qDifference > rDifference && qDifference > sDifference) {
      roundedQ = -roundedR - roundedS;
    } else if (rDifference > sDifference) {
      roundedR = -roundedQ - roundedS;
    }
    // "+ 0" turns -0 into 0.
    return new HexCoordinate(roundedQ + 0, roundedR + 0);
  }

  get id(): string {
    return `q=${this.q}r=${this.r}`;
  }

  neighbors(): HexCoordinate[] {
    return HexCoordinate.NEIGHBOR_OFFSETS.map(
      (offset) => new HexCoordinate(this.q + offset.q, this.r + offset.r),
    );
  }

  distanceTo(other: HexCoordinate): number {
    const dq = this.q - other.q;
    const dr = this.r - other.r;
    return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2;
  }

  isNeighborOf(other: HexCoordinate): boolean {
    return this.distanceTo(other) === 1;
  }

  equals(other: HexCoordinate): boolean {
    return this.q === other.q && this.r === other.r;
  }
}
