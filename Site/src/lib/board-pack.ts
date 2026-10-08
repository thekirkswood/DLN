/** Structured work in a board cell. Prose Hold still stores a plain string. */

export type LandscapePack = {
  v: 1;
  kind: "landscape";
  who: string;
  does: string;
  hear: string;
};

export type LandscapeFieldPack = {
  v: 1;
  kind: "landscape-field";
  internal: string;
  prospects: string;
  sector: string;
  world: string;
};

export type AdvocatePerson = {
  who: string;
  wear: string;
  hear: string;
  never: string;
};

export type AdvocatesPack = {
  v: 1;
  kind: "advocates";
  people: AdvocatePerson[];
};

export type CommentatorsPack = {
  v: 1;
  kind: "commentators";
  who: string;
  from: string;
  story: string;
  skip: string;
  sector: string;
  world: string;
};

export type TrendsPack = {
  v: 1;
  kind: "trends";
  moving: string;
  noise: string;
  refuse: string;
  object: string;
};

export type CulturalPack = {
  v: 1;
  kind: "cultural";
  who: string;
  shame: string;
  belong: string;
  a: string;
  p: string;
  e: string;
  s: string;
};

export type LawRule = {
  rule: string;
  whose: string;
  breaks: string;
  match: string;
};

export type LawsPack = {
  v: 1;
  kind: "laws";
  rules: LawRule[];
};

export type OpinionPack = {
  v: 1;
  kind: "opinion";
  story: string;
  holds: string;
  change: string;
  promise: string;
};

export type SeatPack = {
  v: 1;
  kind: "seat";
  name: string;
  who: string;
  want: string;
  reach: string;
  never: string;
};

export type ScalePack = {
  v: 1;
  kind: "scale";
  scale: "sole-trader" | "bigger-business" | "corporation" | "";
  note: string;
};

export type EvidencePack = {
  v: 1;
  kind: "evidence";
  know: string;
  dont: string;
  need: string;
};

export type RelSort = "person" | "product" | "place";

export type RelNode = {
  id: string;
  name: string;
  sort: RelSort;
};

export type RelLink = {
  from: string;
  to: string;
  how: string;
};

export type RelationsPack = {
  v: 1;
  kind: "relations";
  nodes: RelNode[];
  links: RelLink[];
  from?: string;
  to?: string;
  how?: string;
};

export type IdentityPack = {
  v: 1;
  kind: "identity";
  bit: string;
  shape: string;
  fields: Record<string, string>;
};

/** Founder timeline, stored in IdentityPack.fields.events as year + tab + what, one event per line. */
export type IdentityEvent = { year: string; what: string };

export function readIdentityEvents(raw: string | undefined): IdentityEvent[] {
  const text = (raw || "").trim();
  if (!text) return [];
  if (text.startsWith("[")) {
    try {
      const rows = JSON.parse(text) as IdentityEvent[];
      if (!Array.isArray(rows)) return [];
      return rows
        .map((r) => ({
          year: String(r?.year || "").trim(),
          what: String(r?.what || "").trim(),
        }))
        .filter((r) => r.year || r.what);
    } catch {
      return [];
    }
  }
  return text
    .split("\n")
    .map((line) => {
      const tab = line.indexOf("\t");
      if (tab >= 0) {
        return { year: line.slice(0, tab).trim(), what: line.slice(tab + 1).trim() };
      }
      const dash = line.indexOf(" — ");
      if (dash >= 0) {
        return { year: line.slice(0, dash).trim(), what: line.slice(dash + 3).trim() };
      }
      return { year: "", what: line.trim() };
    })
    .filter((r) => r.year || r.what);
}

export function writeIdentityEvents(events: IdentityEvent[]): string {
  return events
    .map((e) => ({ year: e.year.trim(), what: e.what.trim() }))
    .filter((e) => e.year || e.what)
    .map((e) => `${e.year}\t${e.what}`)
    .join("\n");
}

function identitySummary(pack: IdentityPack): string {
  const f = pack.fields;
  if (pack.bit === "mission" || pack.shape === "job") {
    return [f.job, f.for].map((s) => (s || "").trim()).filter(Boolean).join(" — ");
  }
  if (pack.bit === "founder" || pack.shape === "story") {
    if (f.has === "no") return "No founder story.";
    if (f.has === "later") return "Not yet. Do not invent.";
    const events = readIdentityEvents(f.events);
    const years = events.map((e) => e.year).filter(Boolean).join(" · ");
    const first = events[0]?.what || "";
    return [years || first, f.without].map((s) => (s || "").trim()).filter(Boolean).join(" — ");
  }
  if (pack.bit === "personality" || pack.shape === "behave") {
    return [f.behaves, f.never]
      .map((s) => (s || "").trim())
      .filter(Boolean)
      .join(" — never ");
  }
  return Object.values(f)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" — ");
}

export type MessagePack = {
  v: 1;
  kind: "message";
  line: string;
  never: string;
  doors: string;
};

export type ChannelPack = {
  v: 1;
  kind: "channel";
  screen: string;
  print: string;
  room: string;
  breaks: string;
};

export type CommsAudiencePack = {
  v: 1;
  kind: "comms-audience";
  who: string;
  not: string;
  effect: string;
};

export type SpotlightPack = {
  v: 1;
  kind: "spotlight";
  moments: string;
  share: string;
  quiet: string;
};

export type ProcessPack = {
  v: 1;
  kind: "process";
  stage: string;
  is: string;
  isNot: string;
  sign: string;
  note: string;
  range?: string[];
  direction?: string;
  file?: string;
  sandbox?: string;
  liveHost?: string;
  look?: string;
  often?: string;
};

export type ApesComboPack = {
  v: 1;
  kind: "apes-combo";
  combo: string;
  why: string;
};

export type ApesLensPack = {
  v: 1;
  kind: "apes-lens";
  mindset: string;
  see: string;
  refuse: string;
};

export type WorkbenchToolsPack = {
  v: 1;
  kind: "workbench-tools";
  making: string;
  file: string;
  tools: string[];
};

export type WorkbenchIdeasPack = {
  v: 1;
  kind: "workbench-ideas";
  idea: string;
  stage: string;
  skip: string;
};

export type WorkbenchBoardPack = {
  v: 1;
  kind: "workbench-board";
  focus: string;
  note: string;
};

export type WorkbenchHostPack = {
  v: 1;
  kind: "workbench-host";
  liveUrl: string;
  sandbox: string;
  who: string;
};

export type SolportSittingPack = {
  v: 1;
  kind: "solport-sitting";
  who: string;
  purpose: string;
  leave: string;
};

export type SolportToolsPack = {
  v: 1;
  kind: "solport-tools";
  hands: string[];
  leave: string;
  tempted: string;
};

export type SolportWeekDayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export type SolportWeekDay = {
  day: SolportWeekDayId;
  where: string;
  writes: string;
};

export type SolportChannelsPack = {
  v: 1;
  kind: "solport-channels";
  days: SolportWeekDay[];
  dormant: string;
};

export type SolportContentPack = {
  v: 1;
  kind: "solport-content";
  next: string;
  does: string;
  landscape: string;
};

/** Faculty 06 — not the left-column identity bits. */
export type IdentityPrinciplesPack = {
  v: 1;
  kind: "identity-principles";
  rule: string;
  rush: string;
  optional: string;
};

export type IdentityEthicsPack = {
  v: 1;
  kind: "identity-ethics";
  protocol: string;
  fight: string;
  enforce: string;
  thin: string;
};

export type IdentityToolkitPack = {
  v: 1;
  kind: "identity-toolkit";
  letterhead: string;
  pack: string;
  screen: string;
  sheet: string;
  missing: string;
};

export type IdentitySystemsPack = {
  v: 1;
  kind: "identity-systems";
  understand: string;
  flyer: string;
  site: string;
  fix: string;
};

export type BoardPack =
  | LandscapePack
  | LandscapeFieldPack
  | AdvocatesPack
  | CommentatorsPack
  | TrendsPack
  | CulturalPack
  | LawsPack
  | OpinionPack
  | SeatPack
  | ScalePack
  | EvidencePack
  | RelationsPack
  | IdentityPack
  | MessagePack
  | ChannelPack
  | CommsAudiencePack
  | SpotlightPack
  | ProcessPack
  | ApesComboPack
  | ApesLensPack
  | WorkbenchToolsPack
  | WorkbenchIdeasPack
  | WorkbenchBoardPack
  | WorkbenchHostPack
  | SolportSittingPack
  | SolportToolsPack
  | SolportChannelsPack
  | SolportContentPack
  | IdentityPrinciplesPack
  | IdentityEthicsPack
  | IdentityToolkitPack
  | IdentitySystemsPack;

export function readPack(raw: string): BoardPack | null {
  const text = raw.trim();
  if (!text.startsWith("{")) return null;
  try {
    const row = JSON.parse(text) as BoardPack;
    if (!row || row.v !== 1 || !row.kind) return null;
    return row;
  } catch {
    return null;
  }
}

export function writePack(pack: BoardPack): string {
  return `${JSON.stringify(pack)}\n`;
}

/** Old shared {who, does, hear} pack, or a plain string into `who`. */
export function legacyLandscape(raw: string): { who: string; does: string; hear: string } {
  const pack = readPack(raw);
  if (pack?.kind === "landscape") {
    return { who: pack.who || "", does: pack.does || "", hear: pack.hear || "" };
  }
  if (!pack && raw.trim()) {
    return { who: raw.trim(), does: "", hear: "" };
  }
  return { who: "", does: "", hear: "" };
}

export function emptyAdvocate(): AdvocatePerson {
  return { who: "", wear: "", hear: "", never: "" };
}

export function emptyLaw(): LawRule {
  return { rule: "", whose: "", breaks: "", match: "" };
}

export function seatNameFromHeld(raw: string): string {
  const pack = readPack(raw);
  if (pack?.kind === "seat") return pack.name.trim();
  const line = packSummary(raw).split(" · ")[0]?.trim() || "";
  return line;
}

function joinBits(parts: Array<string | undefined>, sep: string): string {
  return parts
    .map((s) => (s || "").trim())
    .filter(Boolean)
    .join(sep);
}

export function packSummary(raw: string): string {
  const pack = readPack(raw);
  if (!pack) return raw.trim();
  if (pack.kind === "landscape") {
    return joinBits([pack.who, pack.does], " — ");
  }
  if (pack.kind === "landscape-field") {
    return joinBits([pack.internal, pack.prospects, pack.sector, pack.world], " — ");
  }
  if (pack.kind === "advocates") {
    return pack.people.map((p) => p.who.trim()).filter(Boolean).join(" · ");
  }
  if (pack.kind === "commentators") {
    return joinBits([pack.who, pack.story], " — ");
  }
  if (pack.kind === "trends") {
    return joinBits([pack.moving, pack.object], " — ");
  }
  if (pack.kind === "cultural") {
    return joinBits([pack.who, pack.belong], " — ");
  }
  if (pack.kind === "laws") {
    return pack.rules.map((r) => r.rule.trim()).filter(Boolean).join(" · ");
  }
  if (pack.kind === "opinion") {
    return joinBits([pack.story, pack.holds], " — ");
  }
  if (pack.kind === "seat") {
    return joinBits([pack.name, pack.who, pack.want], " · ");
  }
  if (pack.kind === "scale") {
    return joinBits([pack.scale.replace(/-/g, " "), pack.note], " — ");
  }
  if (pack.kind === "evidence") {
    return joinBits([pack.know, pack.need], " — ");
  }
  if (pack.kind === "relations") {
    const named = (pack.nodes || []).map((n) => n.name.trim()).filter(Boolean);
    if (named.length) return named.join(" · ");
    return joinBits([pack.from, pack.to, pack.how], " · ");
  }
  if (pack.kind === "identity") {
    return identitySummary(pack);
  }
  if (pack.kind === "message") {
    return joinBits([pack.line, pack.never], " — ");
  }
  if (pack.kind === "channel") {
    return joinBits([pack.screen, pack.print, pack.room], " · ");
  }
  if (pack.kind === "comms-audience") {
    return joinBits([pack.who, pack.not], " · not ");
  }
  if (pack.kind === "spotlight") {
    return joinBits([pack.share, pack.moments.split("\n")[0]], " — ");
  }
  if (pack.kind === "process") {
    return joinBits([pack.sign, pack.direction, pack.is, (pack.range || [])[0]], " — ");
  }
  if (pack.kind === "apes-combo") {
    return joinBits([pack.combo, pack.why], " — ");
  }
  if (pack.kind === "apes-lens") {
    return joinBits([pack.mindset, pack.see], " — ");
  }
  if (pack.kind === "workbench-tools") {
    return joinBits([pack.making, pack.file, (pack.tools || []).filter(Boolean)[0]], " — ");
  }
  if (pack.kind === "workbench-ideas") {
    return joinBits([pack.idea, pack.stage], " — ");
  }
  if (pack.kind === "workbench-board") {
    return joinBits([pack.focus, pack.note], " — ");
  }
  if (pack.kind === "workbench-host") {
    return joinBits([pack.liveUrl, pack.sandbox], " · ");
  }
  if (pack.kind === "solport-sitting") {
    return joinBits([pack.who, pack.leave], " — ");
  }
  if (pack.kind === "solport-tools") {
    return joinBits([...(pack.hands || []).filter(Boolean), pack.leave], " · ");
  }
  if (pack.kind === "solport-channels") {
    const week = (pack.days || []).map((d) => d.where.trim()).filter(Boolean);
    return joinBits([...week, pack.dormant], " · ");
  }
  if (pack.kind === "solport-content") {
    return joinBits([pack.next, pack.landscape], " — ");
  }
  if (pack.kind === "identity-principles") {
    return joinBits([pack.rule, pack.rush], " — ");
  }
  if (pack.kind === "identity-ethics") {
    return joinBits([pack.protocol, pack.thin], " — ");
  }
  if (pack.kind === "identity-toolkit") {
    return joinBits([pack.letterhead, pack.pack, pack.screen, pack.sheet], " · ");
  }
  if (pack.kind === "identity-systems") {
    return joinBits([pack.understand, pack.flyer, pack.site], " — ");
  }
  return raw.trim();
}

export function packFilled(raw: string): boolean {
  return Boolean(packSummary(raw));
}
