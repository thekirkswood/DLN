import type { AskAnswer, CensusRow, Estate, HouseSlug, PulseSnap } from "@/lib/clock-types";

const CLOCK_HINTS: { house: HouseSlug; words: string[] }[] = [
  { house: "swarm", words: ["swarm", "swarmfund"] },
  { house: "various-titles", words: ["titles", "varioustitles"] },
  { house: "dks", words: ["dave", "dks", "kirkwood", "davekirkwood"] },
  { house: "dln", words: ["dln", "design lab", "designlabnorth", "campus"] },
];

function silence(iso: string | null): string {
  if (!iso) return "never";
  const ms = Date.now() - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return iso;
  const mins = Math.floor(ms / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function rowLine(r: CensusRow): string {
  return `${r.kind} — ${r.count} times. First ${r.firstAt || "never"}. Last ${r.lastAt || "never"} (${silence(r.lastAt)}). ${r.lastSummary || r.firstSummary}`;
}

function pulseLine(p: PulseSnap): string {
  if (p.ok === true) return `${p.name} (${p.liveUrl}) is up. Last ok ${silence(p.lastOk)}.`;
  if (p.ok === false) {
    return `${p.name} (${p.liveUrl}) is down. ${p.misses} miss${p.misses === 1 ? "" : "es"}. Last miss ${silence(p.lastMiss)}.`;
  }
  return `${p.name} pulse unknown.`;
}

function pick(census: CensusRow[], kind: string, house?: string): CensusRow[] {
  return census.filter((r) => r.kind === kind && (!house || r.house === house));
}

function kindHas(census: CensusRow[], needle: string): CensusRow[] {
  return census.filter((r) => r.kind.includes(needle) || r.key.includes(needle));
}

export function answerAsk(question: string, estate: Estate): AskAnswer {
  const q = question.trim().toLowerCase();
  if (!q) {
    return {
      question,
      known: false,
      title: "Ask a fact",
      body: "Name a house, a kind, first, last, or a count.",
      keys: [],
    };
  }

  const keys: string[] = [];
  const lines: string[] = [];

  const wantsPulse =
    /\b(up|down|miss|pulse|health|alive|silent|reach)\b/.test(q) ||
    /swarmfund|varioustitles|davekirkwood|designlabnorth/.test(q);
  const wantsInbox = /\b(inbox|pending|waiting|lab note|queue|working|error)\b/.test(q);
  const wantsAdmin = /\/admin\b|\badmin\b|\bcuriosity\b|\btrap\b|\bprobe\b/.test(q);
  const wantsSwarm = /\bswarm\b|\bcard\b|\bfull frame\b|\bwatch(?:es)?\b|\binterest/.test(q);
  const wantsTitles = /\btitles\b|\bchapter\b|\bgrant\b|\bread\b/.test(q);
  const wantsDks = /\bdave\b|\bdks\b|\bbuilding\b|\bdavekirkwood/.test(q);
  const wantsLogin = /\bsign(?:ed)? in\b|\blogin\b|\bstudio\b/.test(q);
  const wantsShip = /\bship\b|\btag\b|\biteration\b|\bchangelog\b/.test(q);
  const wantsDeep = /\bslash\b|\bdepth\b|\bdeep\b/.test(q);
  const wantsPort =
    /\bport\b|\bports\b|\blocalhost\b|\b:30\d{2}\b|\b:3100\b|\b:5173\b|\b:8787\b|\bblueprint\b|\blan\b|\blinks?\b|\bdln\.local\b|\bnamed host/.test(
      q,
    );

  if (wantsPort && estate.blueprint) {
    const here =
      estate.blueprint.viewer === "lan"
        ? "Debian LAN"
        : estate.blueprint.viewer === "local"
          ? "this PC (localhost)"
          : "the live overlay";
    lines.push(`You are on ${here}. Named LAN is dln.local. Backup ${estate.blueprint.lanHost}.`);
    keys.push("blueprint:ports");
    for (const n of estate.blueprint.nodes) {
      if (n.port == null) {
        lines.push(`${n.name}: no local port. ${n.note}`);
        continue;
      }
      const local =
        n.sittingLocal === true ? "sitting" : n.sittingLocal === false ? "silent" : "unprobed";
      const lan =
        n.sittingLan === true ? "sitting" : n.sittingLan === false ? "silent" : "unprobed";
      lines.push(
        `:${n.port} ${n.name} — localhost ${local}${n.localhost ? ` ${n.localhost}` : ""} · named ${n.named || "—"} · LAN backup ${lan}${n.lan ? ` ${n.lan}` : ""}${n.liveUrl ? ` · live ${n.liveUrl}` : ""}.`,
      );
      keys.push(`blueprint:${n.id}`);
    }
    for (const link of estate.blueprint.links) {
      lines.push(`${link.from} → ${link.to} (${link.via}). ${link.label}`);
    }
  }

  if (wantsPulse || /is .* up/.test(q)) {
    const named = CLOCK_HINTS.filter((h) => h.words.some((w) => q.includes(w)));
    const pulses =
      named.length > 0
        ? estate.pulses.filter((p) => named.some((h) => h.house === p.house))
        : estate.pulses;
    for (const p of pulses) {
      lines.push(pulseLine(p));
      keys.push(`${p.house}:pulse`);
    }
  }

  if (wantsInbox) {
    const rows = estate.census.filter((r) => r.kind.startsWith("agent.inbox."));
    const pending = pick(estate.census, "agent.inbox.pending");
    const total = pending.reduce((n, r) => n + r.count, 0);
    lines.push(`Lab notes pending: ${total}.`);
    for (const r of rows) {
      lines.push(`${r.house} ${r.kind.replace("agent.inbox.", "")}: ${r.count}. First ${r.firstAt || "—"}. Last ${r.lastAt || "—"}.`);
      keys.push(r.key);
    }
  }

  if (wantsAdmin || wantsDeep) {
    const admin = pick(estate.census, "watch.door.admin");
    const hits = pick(estate.census, "watch.door.hit");
    const deep = pick(estate.census, "watch.door.deep");
    if (admin[0]) {
      lines.push(`/admin has been walked ${admin[0].count} times. First ${admin[0].firstAt || "never"}. Last ${admin[0].lastAt || "never"}.`);
      keys.push(admin[0].key);
    } else if (hits[0]) {
      lines.push(`Trap web: ${hits[0].count} attempts. ${hits[0].lastSummary}`);
      keys.push(hits[0].key);
    } else {
      lines.push("No /admin trap census on this disk yet.");
    }
    if (wantsDeep && deep[0]) {
      lines.push(`Doors deeper than 3 slashes: ${deep[0].lastSummary} (${deep[0].count} attempts).`);
      keys.push(deep[0].key);
    }
  }

  if (wantsSwarm) {
    const kinds = [
      "swarm.fullframe.snapshot",
      "swarm.now.published",
      "swarm.now.watches",
      "swarm.now.interests",
      "swarm.card.publish",
      "swarm.signal.watch",
      "swarm.signal.interest",
      "swarm.member.join",
    ];
    let found = false;
    for (const kind of kinds) {
      const rows = kindHas(estate.census, kind) ;
      for (const r of rows) {
        found = true;
        lines.push(rowLine(r));
        keys.push(r.key);
      }
    }
    const extra = estate.census.filter((r) => r.house === "swarm" && r.kind.startsWith("swarm."));
    if (!found && extra.length) {
      for (const r of extra.slice(0, 8)) {
        lines.push(rowLine(r));
        keys.push(r.key);
      }
      found = true;
    }
    if (!found) {
      lines.push("Swarm Full Frame and card counts are unknown until the Swarm face answers /api/clock/census.");
    }
  }

  if (wantsTitles) {
    const ch = pick(estate.census, "titles.chapter");
    const read = pick(estate.census, "titles.read");
    if (ch[0]) {
      lines.push(`Various Titles has ${ch[0].count} chapters. ${ch[0].lastSummary}`);
      keys.push(ch[0].key);
    }
    if (read[0]) {
      lines.push(`Reads: ${read[0].count}. Last ${read[0].lastAt || "never"} · ${read[0].lastSummary}`);
      keys.push(read[0].key);
    }
    if (!ch[0] && !read[0]) {
      lines.push("Titles chapter census missing — unknown kind titles.chapter.");
    }
  }

  if (wantsDks) {
    const b = pick(estate.census, "dks.building");
    const pulse = estate.pulses.find((p) => p.house === "dks");
    lines.push("Dave Kirkwood public wall is still Building.");
    if (pulse) lines.push(pulseLine(pulse));
    if (b[0]) {
      lines.push(rowLine(b[0]));
      keys.push(b[0].key);
    }
  }

  if (wantsLogin) {
    const ok = kindHas(estate.census, "studio.login.ok");
    if (ok[0]) {
      lines.push(`Studio last signed in: ${ok[0].lastActor || "unknown"} at ${ok[0].lastAt || "never"} (${ok[0].count} times).`);
      keys.push(ok[0].key);
    } else {
      lines.push("Studio login facts start when someone next signs in on this book.");
    }
  }

  if (wantsShip) {
    if (estate.live) {
      lines.push(
        `Home iteration ${estate.live.homeIteration ?? "—"}. Live ${estate.live.tag || "no tag"} (health ${estate.live.ok === true ? "up" : estate.live.ok === false ? "silent" : "unknown"}). Home book enquiries ${estate.live.enquiriesOpen}. Open notes ${estate.live.suggestionsOpen}.`,
      );
      keys.push("live:overlay");
    }
    const ship = pick(estate.census, "ship.tag");
    const log = pick(estate.census, "agent.changelog");
    for (const r of [...ship, ...log]) {
      lines.push(rowLine(r));
      keys.push(r.key);
    }
  }

  const unique = Array.from(new Set(lines));
  if (!unique.length) {
    const maybe = estate.census.filter((r) => q.split(/\s+/).some((w) => w.length > 3 && (r.kind.includes(w) || r.lastSummary.toLowerCase().includes(w))));
    if (maybe[0]) {
      return {
        question,
        known: true,
        title: maybe[0].kind,
        body: maybe.map(rowLine).join("\n"),
        keys: maybe.map((r) => r.key),
      };
    }
    return {
      question,
      known: false,
      title: "Unknown",
      body: "The Clock does not have that kind yet. Name a house, port, pulse, inbox, /admin, Swarm Full Frame, Titles chapters, Building, or studio login.",
      keys: [],
    };
  }

  return {
    question,
    known: true,
    title: unique.length === 1 ? "Fact" : "Facts",
    body: unique.join("\n"),
    keys: Array.from(new Set(keys)),
  };
}
