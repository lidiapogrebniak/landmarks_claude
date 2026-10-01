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
  const weights = items.map(getWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    return pickRandom(items);
  }

  let threshold = random() * totalWeight;
  let lastPositiveIndex = 0;
  for (let i = 0; i < items.length; i++) {
    const weight = weights[i] ?? 0;
    if (weight <= 0) {
      continue;
    }
    lastPositiveIndex = i;
    threshold -= weight;
    if (threshold < 0) {
      return items[i] as T;
    }
  }
  // Floating point leftovers: fall back to the last item with a positive weight.
  return items[lastPositiveIndex] as T;
}

/** Picks `count` different items in random order. */
export function pickDistinct<T>(items: readonly T[], count: number): T[] {
  const remaining = [...items];
  const picked: T[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(random() * remaining.length);
    picked.push(...remaining.splice(index, 1));
  }
  return picked;
}
export function getRandomWords(
  count: number,
  words: readonly string[],
): string[] {
  const shuffledWords = [...words].sort(() => 0.5 - random());
  return shuffledWords.slice(0, count);
}
