/** Plate library from logos.ai (16 pages, 1080). Not the locked DLN mark. */

import { type LineId } from "@/data/worklines";

export const BRIEF = "/brief";

export type Plate = {
  n: string;
  file: string;
  what: string;
};

export const PLATES: Plate[] = [
  {
    n: "01",
    file: `${BRIEF}/PNGs/logos-01.png`,
    what: "Book, house, and eye — knowledge and vision",
  },
  {
    n: "02",
    file: `${BRIEF}/PNGs/logos-02.png`,
    what: "Olive triangle with CA monogram",
  },
  {
    n: "03",
    file: `${BRIEF}/PNGs/logos-03.png`,
    what: "MERZ circular seal",
  },
  {
    n: "04",
    file: `${BRIEF}/PNGs/logos-04.png`,
    what: "4×4 rounding system — squares to circle",
  },
  {
    n: "05",
    file: `${BRIEF}/PNGs/logos-05.png`,
    what: "Orange disc and ring",
  },
  {
    n: "06",
    file: `${BRIEF}/PNGs/logos-06.png`,
    what: "Warped grid and sphere — diagnostic",
  },
  {
    n: "07",
    file: `${BRIEF}/PNGs/logos-07.png`,
    what: "PF red plate — Paul Fosbury",
  },
  {
    n: "08",
    file: `${BRIEF}/PNGs/logos-08.png`,
    what: "Applearn — play / hex cluster",
  },
  {
    n: "09",
    file: `${BRIEF}/PNGs/logos-09.png`,
    what: "AH UM wordmark",
  },
  {
    n: "10",
    file: `${BRIEF}/PNGs/logos-10.png`,
    what: "ATTW construction",
  },
  {
    n: "11",
    file: `${BRIEF}/PNGs/logos-11.png`,
    what: "MM grid — MerzMan",
  },
  {
    n: "12",
    file: `${BRIEF}/PNGs/logos-12.png`,
    what: "Cyan book-sphere",
  },
  {
    n: "13",
    file: `${BRIEF}/PNGs/logos-13.png`,
    what: "ModYu wordmark",
  },
  {
    n: "14",
    file: `${BRIEF}/PNGs/logos-14.png`,
    what: "Design, Strategy, Build as one construction",
  },
  {
    n: "15",
    file: `${BRIEF}/PNGs/logos-15.png`,
    what: "DAA — a constructed mark",
  },
  {
    n: "16",
    file: `${BRIEF}/PNGs/logos-16.png`,
    what: "Abstract face",
  },
];

export const MERZ_SEAL = PLATES[2];
export const PF_PLATE = PLATES[6];
export const ROUNDING_GRID = PLATES[3];

export type BrandRoom = "engine" | "board" | "identity" | "solport";

export type BrandPlate = {
  id: string;
  file: string;
  name: string;
  use: string;
  lines?: LineId[];
  rooms?: BrandRoom[];
};

/** Named brands sit on the work they belong to. DAA is on Logos only — not a greenhouse client. */
export const BRANDS: BrandPlate[] = [
  {
    id: "merz",
    file: `${BRIEF}/PNGs/logos-03.png`,
    name: "MERZ",
    use: "The research board — Merz Barn.",
    lines: ["audits"],
    rooms: ["board", "identity"],
  },
  {
    id: "merzman",
    file: `${BRIEF}/PNGs/logos-11.png`,
    name: "MerzMan",
    use: "A constructed double-M. Identity that holds as a grid.",
    lines: ["logos", "identity"],
    rooms: ["identity"],
  },
  {
    id: "pf",
    file: `${BRIEF}/PNGs/logos-07.png`,
    name: "Paul Fosbury",
    use: "Portraits. Mark, print, and the live plot.",
    lines: ["logos", "print", "simple"],
  },
  {
    id: "ahum",
    file: `${BRIEF}/PNGs/logos-09.png`,
    name: "AH UM",
    use: "Wordmark and the records around it.",
    lines: ["logos", "print"],
  },
  {
    id: "modyu",
    file: `${BRIEF}/PNGs/logos-13.png`,
    name: "ModYu",
    use: "Hair and scalp. Identity on the screen, and the site we host.",
    lines: ["logos", "ui", "simple", "apps"],
  },
  {
    id: "swarm",
    file: "/plots/swarm.svg",
    name: "Swarm Fund",
    use: "The hive mark. A studio product, held as a logo.",
    lines: ["logos"],
  },
  {
    id: "choozlist",
    file: "/plots/choozlist.png",
    name: "Choozlist",
    use: "The life registry. A studio product, held as a logo.",
    lines: ["logos"],
  },
  {
    id: "titles",
    file: "/plots/various-titles.png",
    name: "Various Titles",
    use: "Geometric VT. Ideas about marketing and branding, as a mark.",
    lines: ["logos"],
  },
  {
    id: "daa",
    file: `${BRIEF}/PNGs/logos-15.png`,
    name: "DAA",
    use: "A constructed mark from the plate library.",
    lines: ["logos"],
  },
  {
    id: "applearn",
    file: `${BRIEF}/PNGs/logos-08.png`,
    name: "Applearn",
    use: "A learning mark — type, interface, and the app.",
    lines: ["logos", "ui", "apps"],
  },
  {
    id: "attw",
    file: `${BRIEF}/PNGs/logos-10.png`,
    name: "ATTW",
    use: "A constructed AA. Identity that has to work on screen.",
    lines: ["logos", "ui"],
  },
  {
    id: "olive",
    file: `${BRIEF}/PNGs/logos-02.png`,
    name: "Selected identity",
    use: "Olive triangle, CA. A mark built to sit on print.",
    lines: ["logos", "print"],
  },
  {
    id: "face",
    file: `${BRIEF}/PNGs/logos-16.png`,
    name: "Selected identity",
    use: "A face from three cuts. Fashion and the pack.",
    lines: ["logos", "packaging"],
  },
  {
    id: "rounding",
    file: `${BRIEF}/PNGs/logos-04.png`,
    name: "Rounding",
    use: "Square to circle — how a mark is constructed.",
    lines: ["identity", "ui"],
    rooms: ["identity"],
  },
  {
    id: "solport",
    file: `${BRIEF}/PNGs/logos-05.png`,
    name: "Solport",
    use: "A working session. One-to-one counsel on the tools you actually use.",
    lines: ["online"],
    rooms: ["solport"],
  },
  {
    id: "diagnostic",
    file: `${BRIEF}/PNGs/logos-06.png`,
    name: "Diagnostic",
    use: "The loop we run a system through before we change it.",
    lines: ["audits"],
    rooms: ["engine"],
  },
  {
    id: "vision",
    file: `${BRIEF}/PNGs/logos-01.png`,
    name: "Vision",
    use: "Book, house, and eye. Knowledge the work can see from.",
    lines: ["counsel"],
    rooms: ["engine"],
  },
  {
    id: "knowledge",
    file: `${BRIEF}/PNGs/logos-12.png`,
    name: "Knowledge",
    use: "A book you can hold as an object. For people still forming the plan.",
    lines: ["startup", "counsel"],
    rooms: ["engine"],
  },
  {
    id: "doors",
    file: `${BRIEF}/PNGs/logos-14.png`,
    name: "Design, Strategy, Build",
    use: "Three glyphs, one construction. How the offers sit together.",
    lines: ["api"],
    rooms: ["engine", "identity"],
  },
];

export function brandsForLine(id: LineId): BrandPlate[] {
  const rows = BRANDS.filter((row) => row.lines?.includes(id));
  if (id !== "logos") return rows;
  const house = ["modyu", "swarm", "choozlist", "titles", "daa"];
  const front = house
    .map((hid) => rows.find((row) => row.id === hid))
    .filter((row): row is BrandPlate => Boolean(row));
  const rest = rows.filter((row) => !house.includes(row.id));
  return [...front, ...rest];
}

export function brandsForRoom(room: BrandRoom): BrandPlate[] {
  return BRANDS.filter((row) => row.rooms?.includes(room));
}
