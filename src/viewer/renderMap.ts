import type { Cell, IslandMap, LocationType } from "../generator/types.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HEX_SIZE = 40;
const PADDING = 10;
const IMAGE_SIZE = HEX_SIZE * 1.2;

const LOCATION_IMAGES: Record<Exclude<LocationType, "WORD">, string> = {
  WATER: "./images/water.png",
  TREASURE: "./images/treasure.png",
  AMULET: "./images/amulet.png",
  EXIT: "./images/exit.png",
  CURSE: "./images/curse.png",
  TRAP: "./images/trap.png",
};

interface Point {
  x: number;
  y: number;
}

export function renderMap(map: IslandMap): SVGSVGElement {
  const svg = createSvgElement("svg");
  const extent = getFieldExtent(map.radius);
  svg.setAttribute("viewBox", `${-extent.x} ${-extent.y} ${extent.x * 2} ${extent.y * 2}`);
  svg.setAttribute("width", String(extent.x * 2));
  svg.setAttribute("height", String(extent.y * 2));

  for (const cell of map.cells) {
    svg.append(renderCell(cell));
  }
  return svg;
}

/** Half width and half height of the field, including padding. The field is centered at (0, 0). */
function getFieldExtent(radius: number): Point {
  return {
    x: HEX_SIZE * (1.5 * radius + 1) + PADDING,
    y: HEX_SIZE * Math.sqrt(3) * (radius + 0.5) + PADDING,
  };
}

function axialToPixel(cell: Cell): Point {
  return {
    x: HEX_SIZE * 1.5 * cell.q,
    y: HEX_SIZE * Math.sqrt(3) * (cell.r + cell.q / 2),
  };
}

function renderCell(cell: Cell): SVGGElement {
  const center = axialToPixel(cell);
  const group = createSvgElement("g");
  group.dataset["cell"] = `q=${cell.q}r=${cell.r}`;
  group.append(renderHexagon(center));

  const location = cell.location;
  if (location?.type === "WORD") {
    group.append(renderWordLabel(center, location.word ?? ""));
  } else if (location) {
    group.append(renderLocationImage(center, LOCATION_IMAGES[location.type]));
  }
  return group;
}

function renderHexagon(center: Point): SVGPolygonElement {
  const corners = [0, 1, 2, 3, 4, 5].map((i) => {
    const angle = (Math.PI / 3) * i;
    return `${center.x + HEX_SIZE * Math.cos(angle)},${center.y + HEX_SIZE * Math.sin(angle)}`;
  });
  const polygon = createSvgElement("polygon");
  polygon.setAttribute("points", corners.join(" "));
  polygon.setAttribute("fill", "white");
  polygon.setAttribute("stroke", "#555");
  return polygon;
}

function renderWordLabel(center: Point, word: string): SVGTextElement {
  const text = createSvgElement("text");
  text.setAttribute("x", String(center.x));
  text.setAttribute("y", String(center.y));
  text.setAttribute("text-anchor", "middle");
  text.setAttribute("dominant-baseline", "central");
  text.setAttribute("font-size", String(HEX_SIZE * 0.6));
  text.setAttribute("font-family", "sans-serif");
  text.textContent = [...word].slice(0, 2).join("");
  return text;
}

function renderLocationImage(center: Point, href: string): SVGImageElement {
  const image = createSvgElement("image");
  image.setAttribute("href", href);
  image.setAttribute("x", String(center.x - IMAGE_SIZE / 2));
  image.setAttribute("y", String(center.y - IMAGE_SIZE / 2));
  image.setAttribute("width", String(IMAGE_SIZE));
  image.setAttribute("height", String(IMAGE_SIZE));
  return image;
}

function createSvgElement<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
  return document.createElementNS(SVG_NS, tag);
}
