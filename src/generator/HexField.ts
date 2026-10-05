import { Cell } from "./Cell.js";
import { HexCoordinate } from "./HexCoordinate.js";

/** All cells of a flat-top hexagon with the given radius. */
export class HexField {
  readonly cells: Cell[];

  constructor(readonly radius: number) {
    this.cells = this.createCells();
  }

  static cellCount(radius: number): number {
    return 1 + 3 * radius * (radius + 1);
  }

  contains(coordinate: HexCoordinate): boolean {
    const { q, r } = coordinate;
    return Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r)) <= this.radius;
  }

  cellAt(coordinate: HexCoordinate): Cell {
    const cell = this.cells.find((candidate) =>
      candidate.coordinate.equals(coordinate),
    );
    if (!cell) {
      throw new Error(`Cell ${coordinate.id} is outside the field.`);
    }
    return cell;
  }

  neighborsOf(cell: Cell): Cell[] {
    return cell.coordinate
      .neighbors()
      .filter((coordinate) => this.contains(coordinate))
      .map((coordinate) => this.cellAt(coordinate));
  }

  freeCells(): Cell[] {
    return this.cells.filter((cell) => cell.isFree);
  }

  cellsWithGoodLocations(): Cell[] {
    return this.cells.filter((cell) => cell.hasGoodLocation);
  }

  private createCells(): Cell[] {
    const cells: Cell[] = [];
    for (let q = -this.radius; q <= this.radius; q++) {
      for (let r = -this.radius; r <= this.radius; r++) {
        const coordinate = new HexCoordinate(q, r);
        if (this.contains(coordinate)) {
          cells.push(new Cell(coordinate));
        }
      }
    }
    return cells;
  }
}
