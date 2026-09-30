import { generateIslandMap } from "./generator/generateIslandMap.js";
import type { IslandConfig } from "./generator/types.js";
import { loadWords } from "./viewer/loadWords.js";
import { renderMap } from "./viewer/renderMap.js";

const generateButton = getElement<HTMLButtonElement>("generate");
const mapContainer = getElement<HTMLDivElement>("map");
const wordLine = getElement<HTMLParagraphElement>("words");
const errorLine = getElement<HTMLParagraphElement>("error");

const words = await loadWords();
if (words) {
  generateButton.disabled = false;
  generateButton.addEventListener("click", () => showNewMap(words));
  showNewMap(words);
}

function showNewMap(words: string[]): void {
  try {
    const map = generateIslandMap(getSelectedConfig(), words);
    mapContainer.replaceChildren(renderMap(map));
    wordLine.textContent = map.words.join("-");
    errorLine.textContent = "";
  } catch (error) {
    mapContainer.replaceChildren();
    wordLine.textContent = "";
    errorLine.textContent = error instanceof Error ? error.message : String(error);
  }
}

function getSelectedConfig(): IslandConfig {
  const checked = document.querySelector<HTMLInputElement>('input[name="config"]:checked');
  return (checked?.value ?? "beginner") as IslandConfig;
}

function getElement<T extends HTMLElement>(id: string): T {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`Element #${id} not found.`);
  }
  return element as T;
}
