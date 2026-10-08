import { LANDSCAPE_TOKENS } from "@/data/board-map";

export type CellKind =
  | "sheet"
  | "landscape"
  | "advocates"
  | "commentators"
  | "trends"
  | "cultural"
  | "laws"
  | "opinion"
  | "seat"
  | "scale"
  | "evidence"
  | "relations"
  | "apes"
  | "message"
  | "channel"
  | "comms-audience"
  | "spotlight"
  | "process";

const TOKEN_KIND: Record<string, CellKind> = {
  landscape: "landscape",
  advocates: "advocates",
  commentators: "commentators",
  trends: "trends",
  cultural: "cultural",
  laws: "laws",
  opinion: "opinion",
};

for (const t of LANDSCAPE_TOKENS) {
  if (!TOKEN_KIND[t.id]) TOKEN_KIND[t.id] = t.id as CellKind;
}

export function cellKind(faculty: string, topic: string): CellKind {
  if (faculty === "apes") return "apes";
  if (faculty === "process") return "process";
  if (faculty === "comms") {
    if (topic === "message") return "message";
    if (topic === "channel") return "channel";
    if (topic === "audience") return "comms-audience";
    if (topic === "spotlight") return "spotlight";
    return "sheet";
  }
  if (faculty !== "mapping") return "sheet";
  if (topic === "audience") return "seat";
  if (topic === "scale") return "scale";
  if (topic === "evidence") return "evidence";
  if (topic === "relations") return "relations";
  return TOKEN_KIND[topic] || "landscape";
}
