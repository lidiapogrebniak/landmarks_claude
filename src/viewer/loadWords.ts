const WORD_BANK_URL = "./data/wordBank.json";

/** Loads the word list. Returns null (and logs to the console) if loading fails. */
export async function loadWords(): Promise<string[] | null> {
  try {
    const response = await fetch(WORD_BANK_URL);
    if (!response.ok) {
      throw new Error(
        `Failed to load ${WORD_BANK_URL}: HTTP ${response.status}.`,
      );
    }
    return parseWordBank(await response.json());
  } catch (error) {
    console.error(error);
    return null;
  }
}

function parseWordBank(data: unknown): string[] {
  const words =
    typeof data === "object" && data !== null
      ? (data as { words?: unknown }).words
      : undefined;
  if (
    !Array.isArray(words) ||
    !words.every((word) => typeof word === "string")
  ) {
    throw new Error(
      `${WORD_BANK_URL} must have the shape { "words": string[] }.`,
    );
  }
  return words;
}
