import { promises as fs } from "fs";
import path from "path";
import { nowIso } from "@/lib/clock";
import { listInvoices, listRolls } from "@/lib/billing";
import { listEnquiries } from "@/lib/enquiries";
import { listTrapWeb } from "@/lib/trap-web";
import { listOpenInstances } from "@/lib/watch";
import { CLOCK_FACES, overlaySource, type FaceDef } from "@/lib/clock-faces";
import { buildBlueprint } from "@/lib/clock-blueprint";
import {
  censusKey,
  emitClock,
  loadCensus,
  loadPulseBook,
  loadRecent,
  saveCensusRows,
  savePulseBook,
  upsertSnapshot,
  type PulseBook,
} from "@/lib/clock-store";
import type {
  AskAnswer,
  CensusRow,
  ClockEvent,
  Estate,
  EstateBrain,
  EstateLogic,
  EstateModel,
  EstateSituation,
  FacePack,
  FactSource,
  HouseSlug,
  LiveOverlay,
  PulseSnap,
} from "@/lib/clock-types";
import { answerAsk } from "@/lib/clock-ask";
import { listComments } from "@/lib/plans";

type InboxMsg = {
  id?: string;
  createdAt?: string;
  repliedAt?: string;
  status?: string;
};

const PULSE_TIMEOUT = 4000;
const CENSUS_TIMEOUT = 4000;
const MISS_LIMIT = 3;

async function readText(file: string): Promise<string | null> {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

async function statSafe(file: string) {
  try {
    return await fs.stat(file);
  } catch {
    return null;
  }
}

async function listDir(dir: string): Promise<string[]> {
  try {
    return await fs.readdir(dir);
  } catch {
    return [];
  }
}

async function fetchTimed(
  url: string,
  headers: Record<string, string>,
  ms: number,
): Promise<{ ok: boolean; status: number; json: unknown; latencyMs: number } | null> {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: ctrl.signal,
      headers,
    });
    const json = await res.json().catch(() => null);
    return {
      ok: res.ok,
      status: res.status,
      json,
      latencyMs: Date.now() - started,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function snapshotRow(
  house: HouseSlug,
  kind: string,
  count: number,
  firstAt: string | null,
  lastAt: string | null,
  summary: string,
  entityId?: string,
): CensusRow {
  return {
    key: censusKey(house, kind, entityId),
    house,
    kind,
    count,
    firstAt,
    lastAt,
    firstActor: "",
    lastActor: "",
    firstSummary: summary,
    lastSummary: summary,
  };
}

async function snapshotInbox(face: FaceDef): Promise<CensusRow[]> {
  const file = path.join(face.housePath, face.inboxRel, "messages.json");
  const raw = await readText(file);
  if (!raw) {
    return [
      snapshotRow(face.slug, "agent.inbox.pending", 0, null, null, "No inbox on this disk"),
    ];
  }
  let messages: InboxMsg[] = [];
  try {
    const parsed = JSON.parse(raw) as InboxMsg[];
    messages = Array.isArray(parsed) ? parsed : [];
  } catch {
    messages = [];
  }
  const by: Record<string, InboxMsg[]> = {
    pending: [],
    working: [],
    done: [],
    error: [],
  };
  for (const m of messages) {
    const st = m.status || "pending";
    if (!by[st]) by[st] = [];
    by[st].push(m);
  }
  const rows: CensusRow[] = [];
  for (const status of ["pending", "working", "done", "error"] as const) {
    const list = by[status];
    const times = list
      .map((m) => m.repliedAt || m.createdAt || "")
      .filter(Boolean)
      .sort();
    rows.push(
      snapshotRow(
        face.slug,
        `agent.inbox.${status}`,
        list.length,
        times[0] || null,
        times[times.length - 1] || null,
        `${list.length} ${status}`,
      ),
    );
  }
  return rows;
}

async function snapshotChangelog(face: FaceDef): Promise<CensusRow[]> {
  if (!face.changelog) return [];
  const file = path.join(face.housePath, face.changelog);
  const raw = await readText(file);
  if (!raw) return [];
  const lines = raw.split("\n").filter(Boolean);
  let first: { t?: string; s?: string; k?: string } | null = null;
  let last: { t?: string; s?: string; k?: string } | null = null;
  try {
    first = JSON.parse(lines[0] || "null");
    last = JSON.parse(lines[lines.length - 1] || "null");
  } catch {
    /* */
  }
  return [
    snapshotRow(
      face.slug,
      "agent.changelog",
      lines.length,
      first?.t || null,
      last?.t || null,
      last?.s || `${lines.length} changelog lines`,
    ),
  ];
}

async function snapshotShip(face: FaceDef): Promise<CensusRow[]> {
  if (!face.iteration) return [];
  const file = path.join(face.housePath, face.iteration);
  const raw = (await readText(file))?.trim();
  if (!raw) return [];
  const n = Number(raw);
  return [
    snapshotRow(
      face.slug,
      "ship.tag",
      Number.isFinite(n) ? n : 0,
      null,
      null,
      `Iteration ${raw}`,
    ),
  ];
}

async function snapshotLease(face: FaceDef): Promise<EstateSituation | null> {
  const file = path.join(face.housePath, "_meta", "edit-lease.json");
  const raw = await readText(file);
  if (!raw) return null;
  try {
    const lease = JSON.parse(raw) as { seat?: string; until?: string; host?: string };
    const until = lease.until ? Date.parse(lease.until) : 0;
    if (until && until < Date.now()) return null;
    if (!lease.seat) return null;
    return {
      id: `${face.slug}-lease`,
      house: face.slug,
      tone: "warn",
      title: `${face.name} lease`,
      detail: `Held by ${lease.seat}${lease.host ? ` on ${lease.host}` : ""}`,
    };
  } catch {
    return null;
  }
}

async function snapshotTrap(rows: CensusRow[]): Promise<CensusRow[]> {
  const web = await listTrapWeb();
  const admin = web.doors.find((d) => d.path === "/admin" || d.path.startsWith("/admin/"));
  upsertSnapshot(
    rows,
    snapshotRow(
      "dln",
      "watch.door.hit",
      web.attempts,
      web.started,
      web.doors.reduce((last, d) => (d.last > last ? d.last : last), web.started),
      `${web.attempts} trap attempts, ${web.doors.length} doors`,
    ),
  );
  if (admin) {
    upsertSnapshot(
      rows,
      snapshotRow(
        "dln",
        "watch.door.admin",
        admin.attempts,
        admin.first,
        admin.last,
        `/admin walked ${admin.attempts} times`,
        "/admin",
      ),
    );
  }
  const deep = web.doors.filter((d) => d.path.split("/").filter(Boolean).length >= 3);
  const deepHits = deep.reduce((n, d) => n + d.attempts, 0);
  upsertSnapshot(
    rows,
    snapshotRow(
      "dln",
      "watch.door.deep",
      deepHits,
      web.started,
      deep.reduce((last, d) => (d.last > last ? d.last : last), ""),
      `${deep.length} doors deeper than 3 slashes`,
    ),
  );
  return rows;
}

async function snapshotDlnProduct(rows: CensusRow[]) {
  const invoices = await listInvoices().catch(() => []);
  const rolls = await listRolls().catch(() => []);
  const enquiries = await listEnquiries().catch(() => []);
  const times = invoices.map((i) => i.issuedAt || "").filter(Boolean).sort();
  upsertSnapshot(
    rows,
    snapshotRow(
      "dln",
      "product.invoice",
      invoices.length,
      times[0] || null,
      times[times.length - 1] || null,
      `${invoices.length} invoices`,
    ),
  );
  upsertSnapshot(
    rows,
    snapshotRow(
      "dln",
      "product.roll",
      rolls.length,
      null,
      null,
      `${rolls.length} rolls`,
    ),
  );
  const eqTimes = enquiries.map((e) => e.createdAt).filter(Boolean).sort();
  upsertSnapshot(
    rows,
    snapshotRow(
      "dln",
      "product.enquiry",
      enquiries.length,
      eqTimes[0] || null,
      eqTimes[eqTimes.length - 1] || null,
      `${enquiries.filter((e) => e.status === "new").length} new enquiries`,
    ),
  );
  return { invoices, rolls, enquiries };
}

async function snapshotTitlesChapters(): Promise<CensusRow[]> {
  const root = "/home/main/VariousTitles/content";
  const facets = ["marketing", "branding"];
  let n = 0;
  let first: string | null = null;
  let last: string | null = null;
  for (const facet of facets) {
    const names = await listDir(path.join(root, facet));
    for (const name of names.filter((x) => x.endsWith(".md"))) {
      n += 1;
      const st = await statSafe(path.join(root, facet, name));
      if (st) {
        const iso = st.mtime.toISOString();
        if (!first || iso < first) first = iso;
        if (!last || iso > last) last = iso;
      }
    }
  }
  return [
    snapshotRow(
      "various-titles",
      "titles.chapter",
      n,
      first,
      last,
      `${n} chapters on disk`,
    ),
  ];
}

async function snapshotDks(): Promise<CensusRow[]> {
  return [
    snapshotRow("dks", "dks.building", 1, null, nowIso(), "Public wall is still Building"),
  ];
}

export async function backfillLocalFace(): Promise<CensusRow[]> {
  const rows = await loadCensus();
  for (const face of CLOCK_FACES) {
    for (const row of await snapshotInbox(face)) upsertSnapshot(rows, row);
    for (const row of await snapshotChangelog(face)) upsertSnapshot(rows, row);
    for (const row of await snapshotShip(face)) upsertSnapshot(rows, row);
  }
  await snapshotTrap(rows);
  await snapshotDlnProduct(rows);
  for (const row of await snapshotTitlesChapters()) upsertSnapshot(rows, row);
  for (const row of await snapshotDks()) upsertSnapshot(rows, row);
  await saveCensusRows(rows);
  return rows;
}

async function beatPulse(book: PulseBook, face: FaceDef): Promise<PulseSnap> {
  const hit = await fetchTimed(face.liveHealth, { Accept: "application/json" }, PULSE_TIMEOUT);
  const prev = book[face.slug] || {
    house: face.slug,
    ok: null as boolean | null,
    misses: 0,
    lastOk: null as string | null,
    lastMiss: null as string | null,
    lastCheck: nowIso(),
    latencyMs: null as number | null,
  };
  const t = nowIso();
  const ok = Boolean(hit?.ok);
  if (ok) {
    const recovered = prev.misses >= MISS_LIMIT;
    prev.ok = true;
    prev.misses = 0;
    prev.lastOk = t;
    prev.lastCheck = t;
    prev.latencyMs = hit?.latencyMs ?? null;
    if (recovered) {
      await emitClock({
        house: face.slug,
        host: "live",
        plane: "pulse",
        kind: "pulse.ok",
        summary: `${face.name} live health recovered`,
      });
    }
  } else {
    prev.ok = false;
    prev.misses += 1;
    prev.lastMiss = t;
    prev.lastCheck = t;
    prev.latencyMs = hit?.latencyMs ?? null;
    if (prev.misses === MISS_LIMIT) {
      await emitClock({
        house: face.slug,
        host: "live",
        plane: "pulse",
        kind: "pulse.miss",
        summary: `${face.name} live health missed ${MISS_LIMIT} times`,
      });
    }
  }
  book[face.slug] = prev;
  return {
    house: face.slug,
    name: face.name,
    liveUrl: face.liveUrl,
    clockUrl: face.liveClock,
    ok: prev.ok,
    misses: prev.misses,
    lastOk: prev.lastOk,
    lastMiss: prev.lastMiss,
    lastCheck: prev.lastCheck,
    latencyMs: prev.latencyMs,
    source: "live",
  };
}

async function pullFace(
  face: FaceDef,
  overlay: FactSource,
  token: string,
): Promise<FacePack> {
  const urls =
    overlay === "lab"
      ? [face.labCensus, face.liveCensus]
      : [face.liveCensus, face.labCensus];
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };
  for (const url of urls) {
    const source: FactSource = url === face.liveCensus ? "live" : "lab";
    if (face.slug === "dln" && source === overlay) {
      const rows = await loadCensus();
      const recent = await loadRecent(40);
      return {
        house: "dln",
        source,
        at: nowIso(),
        rows,
        recent,
      };
    }
    const hit = await fetchTimed(url, headers, CENSUS_TIMEOUT);
    const data = hit?.json as {
      ok?: boolean;
      rows?: CensusRow[];
      recent?: ClockEvent[];
    } | null;
    if (hit?.ok && data?.ok && Array.isArray(data.rows)) {
      return {
        house: face.slug,
        source,
        at: nowIso(),
        rows: data.rows,
        recent: Array.isArray(data.recent) ? data.recent : [],
      };
    }
  }
  return {
    house: face.slug,
    source: "disk",
    at: nowIso(),
    rows: [],
    recent: [],
    error: "Face census unreachable",
  };
}

async function brainsIndex(): Promise<EstateBrain[]> {
  const out: EstateBrain[] = [];
  async function add(
    house: HouseSlug,
    file: string,
    kind: EstateBrain["kind"],
    rel: string,
  ) {
    const st = await statSafe(file);
    if (!st) return;
    out.push({
      house,
      path: rel,
      kind,
      mtime: st.mtime.toISOString(),
      bytes: st.size,
    });
  }
  for (const name of [
    "protocol.md",
    "BLUEPRINT.md",
    "DIRECTIONS.md",
    "WORKSTREAM.md",
    "greenhouse.md",
    "CHANGELOG.jsonl",
  ]) {
    await add(
      "dln",
      path.join("/home/main/DLN/memory", name),
      name.endsWith(".jsonl") ? "changelog" : "memory",
      `memory/${name}`,
    );
  }
  await add("swarm", "/home/main/SwarmFund/brain/CANON.md", "canon", "brain/CANON.md");
  await add(
    "swarm",
    "/home/main/SwarmFund/brain/rules/HARD_RULES.md",
    "canon",
    "brain/rules/HARD_RULES.md",
  );
  for (const name of ["protocol.md", "BLUEPRINT.md", "DIRECTIONS.md", "CHANGELOG.jsonl"]) {
    await add(
      "various-titles",
      path.join("/home/main/VariousTitles/memory", name),
      name.endsWith(".jsonl") ? "changelog" : "memory",
      `memory/${name}`,
    );
  }
  for (const facet of ["marketing", "branding"]) {
    const dir = path.join("/home/main/VariousTitles/content", facet);
    for (const name of (await listDir(dir)).filter((n) => n.endsWith(".md"))) {
      await add(
        "various-titles",
        path.join(dir, name),
        "chapter",
        `content/${facet}/${name}`,
      );
    }
  }
  await add("dks", "/home/main/DKS/memory/protocol.md", "memory", "memory/protocol.md");
  return out;
}

function models(): EstateModel[] {
  return [
    {
      house: "dln",
      name: "Estate blueprint",
      detail: "Every local port, LAN twin, live URL, lab desk, and join line. Choozlist stays off the rail.",
    },
    {
      house: "dln",
      name: "Greenhouse plots",
      detail: "greenhouse/plots.json — studio vs client, hosts, enterUrl",
    },
    {
      house: "dln",
      name: "Book",
      detail: "Invoices, rolls, diary hours, catalogue",
    },
    {
      house: "swarm",
      name: "Swarm Card + A.P.E.S.",
      detail: "Warrant before publish. Full Frame is counts only.",
    },
    {
      house: "various-titles",
      name: "Facets",
      detail: "Marketing and branding chapters. Third unnamed.",
    },
    {
      house: "dks",
      name: "Building wall",
      detail: "Public is the campus mark and Building. No personal-site model yet.",
    },
  ];
}

function logic(): EstateLogic[] {
  return [
    {
      house: "swarm",
      id: "HR-01",
      name: "HARD_RULES",
      detail: "HR-01…HR-15. No behavioural dossiers. Warrant on card publish.",
    },
    {
      house: "various-titles",
      id: "grant",
      name: "Titles grant",
      detail: "section or full. Billing lives on the DLN book.",
    },
    {
      house: "dln",
      id: "grace",
      name: "Billing grace",
      detail: "Unpaid shut after grace days on the book.",
    },
    {
      house: "dln",
      id: "traps",
      name: "Curiosity paths",
      detail: "/admin /lab /src log to Watch. Clock cites them; Watch bans.",
    },
    {
      house: "dks",
      id: "building",
      name: "Building lock",
      detail: "Public wall stays Building. Clock is studio-only.",
    },
  ];
}

function mergeCensus(faces: FacePack[], disk: CensusRow[]): CensusRow[] {
  const map = new Map<string, CensusRow>();
  for (const row of disk) map.set(row.key, { ...row });
  for (const face of faces) {
    for (const row of face.rows) {
      const prev = map.get(row.key);
      if (!prev) {
        map.set(row.key, { ...row });
        continue;
      }
      if (face.source === "live" || prev.count <= row.count) {
        map.set(row.key, { ...row });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
}

async function liveOverlayFacts(): Promise<LiveOverlay> {
  let homeIteration: number | null = null;
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "..", "memory", "ITERATION"),
      "utf8",
    );
    const n = Number.parseInt(raw.trim(), 10);
    homeIteration = Number.isFinite(n) ? n : null;
  } catch {
    homeIteration = null;
  }
  const enquiries = await listEnquiries().catch(() => []);
  const comments = await listComments().catch(() => []);
  let ok: boolean | null = null;
  let liveIteration: number | null = null;
  let tag: string | null = null;
  let error: string | undefined;
  try {
    const res = await fetch("https://designlabnorth.com/api/health", {
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    });
    ok = res.ok;
    const data = (await res.json()) as { iteration?: number; tag?: string };
    liveIteration = typeof data.iteration === "number" ? data.iteration : null;
    tag = typeof data.tag === "string" ? data.tag : null;
  } catch {
    ok = false;
    error = "Live health silent";
  }
  return {
    ok,
    homeIteration,
    liveIteration,
    tag,
    enquiriesOpen: enquiries.filter((e) => e.status === "new").length,
    suggestionsOpen: comments.filter((c) => !c.planId).length,
    at: nowIso(),
    error,
  };
}

async function situations(
  pulses: PulseSnap[],
  census: CensusRow[],
  invoices: Awaited<ReturnType<typeof listInvoices>>,
  enquiries: Awaited<ReturnType<typeof listEnquiries>>,
  live: LiveOverlay,
): Promise<EstateSituation[]> {
  const out: EstateSituation[] = [];
  for (const p of pulses) {
    if (p.ok === true) {
      out.push({
        id: `${p.house}-pulse`,
        house: p.house,
        tone: "ok",
        title: `${p.name} is up`,
        detail: p.lastOk ? `Last ok ${p.lastOk}` : "Live health answered",
      });
    } else if (p.ok === false) {
      out.push({
        id: `${p.house}-pulse`,
        house: p.house,
        tone: "miss",
        title: `${p.name} is silent`,
        detail: p.misses >= MISS_LIMIT ? `${p.misses} misses` : `Miss ${p.misses}`,
      });
    } else {
      out.push({
        id: `${p.house}-pulse`,
        house: p.house,
        tone: "idle",
        title: `${p.name} unknown`,
        detail: "No pulse yet",
      });
    }
    const face = CLOCK_FACES.find((f) => f.slug === p.house);
    if (face) {
      const lease = await snapshotLease(face);
      if (lease) out.push(lease);
    }
  }
  const pending = census.filter((r) => r.kind === "agent.inbox.pending");
  const waiting = pending.reduce((n, r) => n + r.count, 0);
  out.push({
    id: "estate-inbox",
    house: "estate",
    tone: waiting ? "warn" : "idle",
    title: waiting ? `${waiting} lab notes waiting` : "Lab queues idle",
    detail: pending.map((r) => `${r.house} ${r.count}`).join(" · ") || "No inboxes",
  });
  const due = invoices.filter((i) => i.status === "due");
  out.push({
    id: "dln-pay",
    house: "dln",
    tone: due.length ? "warn" : "ok",
    title: due.length ? `${due.length} invoices due` : "Nothing due",
    detail: `${invoices.length} invoices on the book`,
  });
  const fresh = enquiries.filter((e) => e.status === "new");
  out.push({
    id: "dln-onboard",
    house: "dln",
    tone: fresh.length ? "warn" : "idle",
    title: fresh.length ? `${fresh.length} waiting to onboard` : "Onboarding quiet",
    detail: `${enquiries.length} enquiries on the home book`,
  });
  const diverge =
    live.homeIteration != null &&
    live.liveIteration != null &&
    live.homeIteration !== live.liveIteration;
  out.push({
    id: "dln-live",
    house: "dln",
    tone: live.ok === false ? "miss" : diverge ? "warn" : "ok",
    title:
      live.ok === false
        ? "Live pulse silent"
        : diverge
          ? "Live behind the home book"
          : "Live overlay",
    detail: `Home dln-${live.homeIteration ?? "?"} · live ${live.tag || "no tag yet"} · ${live.enquiriesOpen} home enquiries · ${live.suggestionsOpen} open notes. Edit the home book, not a second live book.`,
  });
  const traps = await listOpenInstances().catch(() => []);
  const signed = traps.filter((t) => t.email);
  out.push({
    id: "dln-watch",
    house: "dln",
    tone: traps.length ? "warn" : "ok",
    title: traps.length ? `${traps.length} open Watch plates` : "Watch quiet",
    detail: `${signed.length} signed-in · ban UI stays on Watch`,
  });
  const ff = census.find((r) => r.kind === "swarm.fullframe.snapshot" || r.kind.startsWith("swarm.card"));
  out.push({
    id: "swarm-mode",
    house: "swarm",
    tone: "idle",
    title: "Swarm Mode A",
    detail: ff
      ? ff.lastSummary
      : "Full Frame counts arrive when the Swarm face answers",
  });
  out.push({
    id: "dks-building",
    house: "dks",
    tone: "idle",
    title: "Dave Kirkwood is still Building",
    detail: "Public wall unchanged. Clock is the studio room on that host.",
  });
  return out;
}

export async function buildEstate(opts: {
  token: string;
  hostHeader: string | null;
}): Promise<Estate> {
  const overlay = overlaySource(opts.hostHeader);
  const blueprintP = buildBlueprint(opts.hostHeader);
  const live = await liveOverlayFacts();
  const disk = await backfillLocalFace();
  const product = await snapshotDlnProduct(await loadCensus());
  const pulseBook = await loadPulseBook();
  const pulses: PulseSnap[] = [];
  for (const face of CLOCK_FACES) {
    pulses.push(await beatPulse(pulseBook, face));
  }
  await savePulseBook(pulseBook);
  const faces: FacePack[] = [];
  for (const face of CLOCK_FACES) {
    faces.push(await pullFace(face, overlay, opts.token));
  }
  const census = mergeCensus(faces, disk);
  const sits = await situations(pulses, census, product.invoices, product.enquiries, live);
  const blueprint = await blueprintP;
  return {
    at: nowIso(),
    overlay,
    live,
    pulses,
    situations: sits,
    census,
    faces,
    brains: await brainsIndex(),
    models: models(),
    logic: logic(),
    blueprint,
    askHints: [
      "What ports are sitting?",
      "Is swarmfund up?",
      "How many lab notes are pending?",
      "Last ship tag",
      "Named hosts",
      "How many times has /admin been walked?",
      "Swarm published cards",
      "How many Various Titles chapters?",
      "Is davekirkwood still Building?",
      "Who last signed in as studio?",
    ],
  };
}

export async function localCensusPack(): Promise<{ rows: CensusRow[]; recent: ClockEvent[] }> {
  const rows = await backfillLocalFace();
  const recent = await loadRecent(40);
  return { rows, recent };
}

export { answerAsk };
export type { AskAnswer };
