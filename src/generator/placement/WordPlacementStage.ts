import type { Cell } from "../Cell.js";
import type { HexField } from "../HexField.js";
import { Location } from "../Location.js";
import { pickRandom } from "../random.js";
import type { PlacementStage } from "./PlacementStage.js";

/** Stage 1: places the three words on a connected group of cells A, B, C. */
export class WordPlacementStage implements PlacementStage {
  constructor(private readonly words: [string, string, string]) {}

  placeOn(field: HexField): void {
    const cellA = pickRandom(field.cells);
    const cellB = pickRandom(field.neighborsOf(cellA));
    const cellC = pickRandom(this.candidatesForThirdCell(field, cellA, cellB));

    const [wordA, wordB, wordC] = this.words;
    cellA.place(Location.ofWord(wordA));
    cellB.place(Location.ofWord(wordB));
    cellC.place(Location.ofWord(wordC));
  }

  /** Neighbors of A and of B, keeping duplicates, so cells next to both are twice as likely. */
  private candidatesForThirdCell(
    field: HexField,
    cellA: Cell,
    cellB: Cell,
  ): Cell[] {
    return [...field.neighborsOf(cellA), ...field.neighborsOf(cellB)].filter(
      (cell) => cell !== cellA && cell !== cellB,
    );
  }
}
