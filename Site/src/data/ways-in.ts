import { type Facet } from "@/data/needs";

/**
 * How people come in. Not “packages”. Strategy + Build without Design
 * is not a walk on the wall — that happens in a sitting, then we put
 * them through to Build.
 */
export type WayId =
  | "build-host"
  | "design-build-host"
  | "full-walk"
  | "design-only"
  | "strategy-only";

export type WayIn = {
  id: WayId;
  name: string;
  who: string;
  includes: string[];
  /** Catalogue line for the one-off. */
  onceId?: string;
  /** Monthly host is always live + sandbox. */
  host?: boolean;
  sittingId?: string;
  sittingLongId?: string;
  /** Write to Design / Build instead of the contact form. */
  mail?: "design" | "build" | "both";
  facet: Facet;
  needId: string;
  wall: boolean;
};

export const WAYS_IN: WayIn[] = [
  {
    id: "build-host",
    name: "The site",
    who: "You already have the look — mark, colours, the idea. You want the place, and us to keep coming in.",
    includes: [
      "A sitting with Build — half an hour, or an hour",
      "The site, from the ground or a refresh",
      "Live and sandbox as one host",
    ],
    onceId: "site-ground",
    host: true,
    mail: "build",
    facet: "build",
    needId: "walk-build-host",
    wall: true,
  },
  {
    id: "design-build-host",
    name: "The look and the site",
    who: "A first drawing, or a refresh of who you are, then the place it lives.",
    includes: [
      "A sitting with Design",
      "A sitting with Build",
      "The site",
      "Live and sandbox as one host",
    ],
    onceId: "design-build",
    host: true,
    mail: "both",
    facet: "design",
    needId: "walk-design-build",
    wall: true,
  },
  {
    id: "full-walk",
    name: "The whole walk",
    who: "Who you are, how you say it, and the place you work from. New, or a full redo.",
    includes: [
      "A Strategy sitting",
      "A sitting with Design",
      "A sitting with Build",
      "The site",
      "Live and sandbox as one host",
    ],
    onceId: "walk-full",
    host: true,
    facet: "strategy",
    needId: "walk-full",
    wall: false,
  },
  {
    id: "design-only",
    name: "The look",
    who: "Happy with the website. You want the mark, the print, the pretty things.",
    includes: ["Time with Design — about an hour"],
    sittingId: "session-design",
    mail: "design",
    facet: "design",
    needId: "walk-design",
    wall: false,
  },
  {
    id: "strategy-only",
    name: "Strategy talks",
    who: "An hour, or two. The field, the competitors, how you line up, how you go out. Not a site in the room unless you ask.",
    includes: [
      "Time with Strategy — an hour, or two",
      "Market and competitor look",
      "Brand alignment and how you shout",
    ],
    sittingId: "consultation",
    sittingLongId: "session-strategy-2h",
    facet: "strategy",
    needId: "walk-strategy",
    wall: true,
  },
];

export function waysOnTheWall(): WayIn[] {
  return WAYS_IN.filter((row) => row.wall);
}
