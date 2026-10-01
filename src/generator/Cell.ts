import type { HexCoordinate } from "./HexCoordinate.js";
import type { Location } from "./Location.js";

/** One hexagon of the field. Holds at most one location. */
export class Cell {
  private currentLocation: Location | null = null;

  constructor(readonly coordinate: HexCoordinate) {}

  get location(): Location | null {
    return this.currentLocation;
  }

  get isFree(): boolean {
    return this.currentLocation === null;
  }

  get hasGoodLocation(): boolean {
    return this.currentLocation?.isGood ?? false;
  }

  place(location: Location): void {
    if (!this.isFree) {
      throw new Error(`Cell ${this.coordinate.id} is already occupied.`);
    }
    this.currentLocation = location;
  }
}
