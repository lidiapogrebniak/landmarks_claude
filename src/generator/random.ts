export function pickRandom<T>(items: readonly T[]): T {
  const item = items[Math.floor(Math.random() * items.length)];
  if (item === undefined) {
    throw new Error("Cannot pick from an empty list.");
  }
  return item;
}

/**
 * Picks an item with probability proportional to its weight.
 * If all weights are 0, picks uniformly.
 */
export function pickWeighted<T>(items: readonly T[], getWeight: (item: T) => number): T {
  const weights = items.map(getWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight <= 0) {
    return pickRandom(items);
  }

  let threshold = Math.random() * totalWeight;
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
    const index = Math.floor(Math.random() * remaining.length);
    picked.push(...remaining.splice(index, 1));
  }
  return picked;
}
