import { getCellCount } from "./hexGrid.js";
import { CONFIGS, getTotalLocationCount, WORD_COUNT } from "./settings.js";
import type { IslandConfig } from "./types.js";

const MIN_WORD_LENGTH = 2;

export function validateRadius(radius: number): void {
  if (!Number.isInteger(radius) || radius < 1) {
    throw new Error(`Radius must be an integer of at least 1, received: ${String(radius)}.`);
  }
}

export function validateConfig(config: string): asserts config is IslandConfig {
  if (!(CONFIGS as string[]).includes(config)) {
    throw new Error(`Config must be one of ${CONFIGS.join(", ")}, received: ${String(config)}.`);
  }
}

export function validateFieldSize(radius: number, config: IslandConfig): void {
  const cellCount = getCellCount(radius);
  const locationCount = getTotalLocationCount(config);
  if (cellCount < locationCount) {
    throw new Error(
      `Field of radius ${radius} has ${cellCount} cells, ` +
        `but config "${config}" needs ${locationCount} locations.`,
    );
  }
}

export function validateUniqueWordCount(uniqueWords: readonly string[]): void {
  if (uniqueWords.length < WORD_COUNT) {
    throw new Error(
      `Word list must contain at least ${WORD_COUNT} unique words, received: ${uniqueWords.length}.`,
    );
  }
}

export function validateSelectedWord(word: string): void {
  if ([...word].length < MIN_WORD_LENGTH) {
    throw new Error(
      `Selected word must be at least ${MIN_WORD_LENGTH} letters long, received: "${word}".`,
    );
  }
}
