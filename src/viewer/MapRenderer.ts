import type { Cell } from "../generator/Cell.js";
import type { IslandMap } from "../generator/IslandMap.js";
import type { LandmarkType } from "../generator/types.js";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

const LOCATION_IMAGES: Record<LandmarkType, string> = {
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

/** Draws an island map as an SVG of flat-top hexagons. */
export class MapRenderer {
  private readonly padding = 10;
  private readonly imageSize: number;

  constructor(private readonly hexSize = 40) {
    this.imageSize = hexSize * 1.7;
  }

  render(map: IslandMap): SVGSVGElement {
    const svg = this.createElement("svg");
    const halfSize = this.halfSizeOfField(map.radius);
    svg.setAttribute(
      "viewBox",
      `${-halfSize.x} ${-halfSize.y} ${halfSize.x * 2} ${halfSize.y * 2}`,
    );
    svg.setAttribute("width", String(halfSize.x * 2));
    svg.setAttribute("height", String(halfSize.y * 2));
    svg.append(...map.cells.map((cell) => this.renderCell(cell)));
    return svg;
  }

  /** Half width and half height of the field, including padding. The field is centered at (0, 0). */
  private halfSizeOfField(radius: number): Point {
    return {
      x: this.hexSize * (1.5 * radius + 1) + this.padding,
      y: this.hexSize * Math.sqrt(3) * (radius + 0.5) + this.padding,
    };
  }

  private centerOf(cell: Cell): Point {
    const { q, r } = cell.coordinate;
    return {
      x: this.hexSize * 1.5 * q,
      y: this.hexSize * Math.sqrt(3) * (r + q / 2),
    };
  }

  private renderCell(cell: Cell): SVGGElement {
    const center = this.centerOf(cell);
    const group = this.createElement("g");
    group.dataset["cell"] = cell.coordinate.id;
    group.append(this.renderHexagon(center));

    const location = cell.location;
    if (location?.word) {
      group.append(this.renderWordLabel(center, location.word));
    } else if (location && location.type !== "WORD") {
      group.append(this.renderImage(center, LOCATION_IMAGES[location.type]));
    }
    return group;
  }

  private renderHexagon(center: Point): SVGPolygonElement {
    const corners = [0, 1, 2, 3, 4, 5].map((index) => {
      const angle = (Math.PI / 3) * index;
      return `${center.x + this.hexSize * Math.cos(angle)},${center.y + this.hexSize * Math.sin(angle)}`;
    });
    const polygon = this.createElement("polygon");
    polygon.setAttribute("points", corners.join(" "));
    polygon.setAttribute("fill", "white");
    polygon.setAttribute("stroke", "#555");
    return polygon;
  }

  private renderWordLabel(center: Point, word: string): SVGTextElement {
    const text = this.createElement("text");
    text.setAttribute("x", String(center.x));
    text.setAttribute("y", String(center.y));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "central");
    text.setAttribute("font-size", String(this.hexSize * 0.6));
    text.setAttribute("font-family", "sans-serif");
    text.textContent = [...word].slice(0, 2).join("");
    return text;
  }

  private renderImage(center: Point, href: string): SVGImageElement {
    const image = this.createElement("image");
    image.setAttribute("href", href);
    image.setAttribute("x", String(center.x - this.imageSize / 2));
    image.setAttribute("y", String(center.y - this.imageSize / 2));
    image.setAttribute("width", String(this.imageSize));
    image.setAttribute("height", String(this.imageSize));
    return image;
  }

  private createElement<K extends keyof SVGElementTagNameMap>(
    tag: K,
  ): SVGElementTagNameMap[K] {
    return document.createElementNS(SVG_NAMESPACE, tag);
  }
}
