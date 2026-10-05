let seed = 0;

export function setSeed(value: number): void {
  seed = value | 0;
}

/** Seeded pseudo-random number in [0, 1) (mulberry32). */
export default function random(): number {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function pickRandom<T>(items: readonly T[]): T {
  const item = items[Math.floor(random() * items.length)];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list.");
  }
  return item;
}

/**
 * Picks an item with probability proportional to its weight.
 * If all weights are 0, picks uniformly.
 */
export function pickWeighted<T>(
  items: readonly T[],
  getWeight: (item: T) => number,
): T {
  const weightedItems = items.map((item) => ({
    item,
    weight: getWeight(item),
  }));
  const totalWeight = weightedItems.reduce(
    (sum, { weight }) => sum + weight,
    0,
  );
  if (totalWeight <= 0) {
    return pickRandom(items);
  }

  let remaining = random() * totalWeight;
  const positiveItems = weightedItems.filter(({ weight }) => weight > 0);
  for (const { item, weight } of positiveItems) {
    remaining -= weight;
    if (remaining < 0) {
      return item;
    }
  }
  // Floating point leftovers: the threshold landed at the very end.
  return pickLast(positiveItems).item;
}

export function getRandomWords(
  count: number,
  words: readonly string[],
): string[] {
  const shuffledWords = [...words].sort(() => 0.5 - random());
  return shuffledWords.slice(0, count);
}

function pickLast<T>(items: readonly T[]): T {
  const item = items[items.length - 1];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list.");
  }
  return item;
}
