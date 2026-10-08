import { BRAND_BITS_LEFT } from "@/data/campus";
import { ENGINE_STAGES, FACULTIES, facultyById, type Faculty, type FacultyId } from "@/data/faculties";
import { frameworkTopics, type FrameworkTopic } from "@/data/framework-play";

/** Every room on the campus board. Overview first; play is honed later in each room. */
export type BoardRoomId = FacultyId | "plot";

export type BoardRoom = {
  id: BoardRoomId;
  n: string;
  name: string;
  href: string;
  kind: "avenue" | "plot";
  caption: string;
  stage: "scope" | "play";
};

export const BOARD_ROOMS: BoardRoom[] = [
  ...FACULTIES.map((f) => ({
    id: f.id,
    n: f.n,
    name: f.name,
    href: `/board/${f.id}`,
    kind: "avenue" as const,
    caption: f.caption,
    stage: "play" as const,
  })),
  {
    id: "plot",
    n: "00",
    name: "Plot",
    href: "/board/plot",
    kind: "plot",
    caption: "The communal book for a live site — bits, prompts, funnel.",
    stage: "play",
  },
];

/** Binder overview — landscape table. Short names from the MAP stack, rooms stay ENGINE_STAGES. */
export const PROCESS_STEPS = ENGINE_STAGES.map((s, i) => ({
  id: `stage-${s.n}`,
  n: s.n,
  short: (["Object", "People", "RAD", "Concepts", "Candidate", "System", "Implementation", "Guardianship"] as const)[i],
  name: s.name,
  href: `/board/process/stage-${s.n}`,
}));

export const LANDSCAPE_TOKENS = [
  { id: "advocates", label: "Advocates", href: "/board/mapping/advocates", lede: "People who speak for the work" },
  { id: "commentators", label: "Commentators", href: "/board/mapping/commentators", lede: "People who speak about it" },
  { id: "trends", label: "Trends/Style", href: "/board/mapping/trends", lede: "What is moving in form" },
  { id: "cultural", label: "Cultural/Social", href: "/board/mapping/cultural", lede: "How it is read between people" },
  { id: "laws", label: "Laws. Rules.", href: "/board/mapping/laws", lede: "What the work cannot ignore" },
  { id: "opinion", label: "Public opinion", href: "/board/mapping/opinion", lede: "The story already in the room" },
] as const;

export const CUSTOMER_SEATS = Array.from({ length: 8 }, (_, i) => ({
  n: String(i + 1),
  href: `/board/mapping/audience?seat=${i + 1}`,
  label: `Customer ${i + 1}`,
}));

export const BRIEFING_NOTES = [
  { n: "1", label: "Ownership involvement", href: "/board/process/stage-1" },
  { n: "2", label: "Process and protocols", href: "/board/process" },
  { n: "3", label: "The board", href: "/board/workbench/board" },
  { n: "4", label: "The live host", href: "/board/workbench/host" },
  { n: "5", label: "Guardianship", href: "/board/process/stage-8" },
] as const;

export const APES_COMPASS = [
  { letter: "A", name: "Analytical", href: "/board/apes/analytical" },
  { letter: "P", name: "Practical", href: "/board/apes/practical" },
  { letter: "E", name: "Emotional", href: "/board/apes/emotional" },
  { letter: "S", name: "Social", href: "/board/apes/social" },
] as const;

export const IDENTITY_BITS = BRAND_BITS_LEFT.map((b) => ({
  id: b.id,
  label: b.label,
  href: `/board/plot/${b.id}`,
}));

export function boardOverviewHref(): string {
  return "/board";
}

export function boardAvenueHref(id: FacultyId): string {
  return `/board/${id}`;
}

export function boardTopicHref(id: FacultyId, topic: string): string {
  return `/board/${id}/${topic}`;
}

export function boardRoomById(id: string): BoardRoom | undefined {
  return BOARD_ROOMS.find((r) => r.id === id);
}

export function boardAvenue(id: string): Faculty | undefined {
  return facultyById(id);
}

const MAPPING_TOKEN_TOPICS: FrameworkTopic[] = [
  ...LANDSCAPE_TOKENS.map((t) => ({
    id: t.id,
    name: t.label,
    body: t.label,
  })),
  { id: "audience", name: "Customers", body: "Seats 1–8 on the right of the table." },
];

export function boardTopic(id: string, topic: string): FrameworkTopic | undefined {
  const faculty = facultyById(id);
  if (!faculty) return undefined;
  const listed = frameworkTopics(faculty.id).find((t) => t.id === topic);
  if (listed) return listed;
  if (faculty.id === "mapping") {
    return MAPPING_TOKEN_TOPICS.find((t) => t.id === topic);
  }
  return undefined;
}

export function isBoardAvenueId(id: string): id is FacultyId {
  return Boolean(facultyById(id));
}

export type BoardVector = { u: number; v: number; a: number };

export type FacultyArc = BoardVector & {
  id: FacultyId;
  start: number;
  span: number;
  count: number;
};

export function boardSlice(i: number, n = FACULTIES.length): number {
  return (i / n) * Math.PI * 2 - Math.PI / 2;
}

export function boardVector(a: number): BoardVector {
  return { u: Math.sin(a), v: Math.cos(a), a };
}

function cssNum(n: number): string {
  return String(Math.round(n * 1000) / 1000);
}

/** Unitless CSS custom props — React must not append `px`. */
export function boardUvStyle(pt: BoardVector): { "--u": string; "--v": string } {
  return { "--u": cssNum(pt.u), "--v": cssNum(pt.v) };
}

/**
 * Wedges sized by topic count so 8 Process gets a wider outer arc
 * than a four-topic avenue. Avenues sit at the centre of their wedge.
 */
export function facultyArcs(): FacultyArc[] {
  const counts = FACULTIES.map((f) => Math.max(1, frameworkTopics(f.id).length));
  const total = counts.reduce((sum, n) => sum + n, 0);
  let cursor = -Math.PI / 2;
  return FACULTIES.map((f, i) => {
    const count = counts[i];
    const span = (count / total) * Math.PI * 2;
    const start = cursor;
    const a = start + span / 2;
    cursor += span;
    return { id: f.id, start, span, count, ...boardVector(a) };
  });
}

/** Unit ring for the seven avenues. CSS `--r` sets the actual radius. */
export function avenueRing(): { id: FacultyId; u: number; v: number; a: number }[] {
  return facultyArcs().map(({ id, u, v, a }) => ({ id, u, v, a }));
}

/** Place `count` tokens evenly through an arc (topics on the outer ring). */
export function arcSpread(start: number, span: number, count: number): BoardVector[] {
  if (count <= 0) return [];
  if (count === 1) return [boardVector(start + span / 2)];
  return Array.from({ length: count }, (_, j) => boardVector(start + ((j + 0.5) / count) * span));
}

/** Place `count` tokens in that avenue’s slice of the ring. */
export function sliceSpread(a: number, count: number, span = (Math.PI * 2) / 7 * 0.7): BoardVector[] {
  if (count <= 1) return [boardVector(a)];
  return Array.from({ length: count }, (_, j) => {
    const t = (j / (count - 1) - 0.5) * span;
    return boardVector(a + t);
  });
}

export function ringPositions(radius = 280): { id: FacultyId; x: number; z: number; yaw: number }[] {
  return avenueRing().map((row) => ({
    id: row.id,
    x: row.u * radius,
    z: row.v * radius,
    yaw: (row.a * 180) / Math.PI,
  }));
}
