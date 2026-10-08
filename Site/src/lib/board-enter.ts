/** Walk stays on `/board`. `enter` is the cell key. Old topic routes are fallbacks. */

export type BoardEnterKind = "showcase" | "bit" | "topic";

export type BoardEnter = {
  key: string;
  region: string;
  kind: BoardEnterKind;
  faculty?: string;
  topic?: string;
  bit?: string;
  seat?: string;
};

const FACULTY_REGION: Record<string, string> = {
  mapping: "landscape",
  comms: "senses",
  process: "process",
  workbench: "brief",
  apes: "senses",
  identity: "identity",
  solport: "customers",
};

export const AVENUE_FIRST: Record<string, string> = {
  mapping: "mapping:advocates",
  comms: "comms:message",
  process: "process:stage-1",
  workbench: "workbench:board",
  apes: "apes:analytical",
  identity: "identity:principles",
  solport: "solport:sitting",
};

export function avenueEnterHref(id: string, plot?: string): string {
  if (id === "plot") return boardEnterHref("plot", plot);
  const key = AVENUE_FIRST[id];
  if (!key) return boardEnterHref("", plot);
  return boardEnterHref(key, plot);
}

export function boardEnterHref(key: string, plot?: string): string {
  const q = new URLSearchParams();
  if (plot) q.set("plot", plot);
  if (key) q.set("enter", key);
  const s = q.toString();
  return s ? `/board?${s}` : "/board";
}

export function parseEnter(raw: string | undefined | null): BoardEnter | null {
  const key = (raw || "").trim();
  if (!key) return null;
  if (key === "plot") return { key, region: "object", kind: "showcase" };
  const parts = key.split(":");
  if (parts[0] === "plot" && parts[1]) {
    return { key, region: "identity", kind: "bit", faculty: "identity", bit: parts[1] };
  }
  if (parts[0] === "mapping" && parts[1] === "audience" && parts[2]) {
    return {
      key,
      region: "customers",
      kind: "topic",
      faculty: "mapping",
      topic: "audience",
      seat: parts[2],
    };
  }
  const faculty = parts[0];
  const topic = parts[1];
  if (!faculty || !topic) return null;
  const region =
    faculty === "mapping" && topic === "audience" ? "customers" : FACULTY_REGION[faculty] || "object";
  return { key, region, kind: "topic", faculty, topic };
}

export function enterKeyFromHref(href: string): string | null {
  if (!href || href.startsWith("#")) return null;
  let url: URL;
  try {
    url = new URL(href, "http://board.local");
  } catch {
    return null;
  }
  if (url.searchParams.get("book") === "1") return null;
  if (url.searchParams.get("enter")) return url.searchParams.get("enter");
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (path === "/board") return null;
  if (path === "/board/plot") return "plot";
  const bit = path.match(/^\/board\/plot\/([a-z0-9-]+)$/);
  if (bit) return `plot:${bit[1]}`;
  const topic = path.match(/^\/board\/(comms|mapping|process|workbench|apes|identity|solport)\/([a-z0-9-]+)$/);
  if (topic) {
    if (topic[1] === "mapping" && topic[2] === "audience") {
      const seat = url.searchParams.get("seat")?.trim();
      if (seat) return `mapping:audience:${seat}`;
    }
    return `${topic[1]}:${topic[2]}`;
  }
  const avenue = path.match(/^\/board\/(comms|mapping|process|workbench|apes|identity|solport)$/);
  if (avenue) return AVENUE_FIRST[avenue[1]] || null;
  return null;
}

export function isBoardTableHref(href: string): boolean {
  if (!href) return false;
  try {
    const url = new URL(href, "http://board.local");
    return url.pathname.replace(/\/$/, "") === "/board" && !url.searchParams.get("enter");
  } catch {
    return false;
  }
}
