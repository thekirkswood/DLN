import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isStudio, type PublicUser } from "@/lib/auth";
import { listInvoices, listRolls, plotShutFor, type Roll } from "@/lib/billing";
import { getSettings } from "@/lib/settings";
import {
  DEFAULT_GEN_COST,
  DEFAULT_PING_COST,
  DEFAULT_TOKEN_GRANTS,
  TOKEN_PRESETS,
  type BoomStackId,
} from "@/data/boomstack";
import { nowIso } from "@/lib/clock";

const FILE = path.join(process.cwd(), "..", "_meta", "billing", "tokens.json");

export type TokenReason = "grant" | "ping" | "capture" | "gen" | "adjust";

export type TokenEntry = {
  id: string;
  t: string;
  k: TokenReason;
  n: number;
  reason: string;
  by: string;
  captureId?: string;
};

export type TokenLedger = {
  id: string;
  userId: string;
  plotSlug: string;
  stack: BoomStackId;
  balance: number;
  period: string;
  grantedThisPeriod: number;
  entries: TokenEntry[];
};

type TokenBook = { ledgers: TokenLedger[] };

function blank(): TokenBook {
  return { ledgers: [] };
}

let chain: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function periodKey(iso = nowIso()): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

async function readBook(): Promise<TokenBook> {
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as TokenBook;
    if (parsed && Array.isArray(parsed.ledgers)) return parsed;
  } catch {
    /* empty */
  }
  return blank();
}

async function writeBook(book: TokenBook) {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, `${JSON.stringify(book, null, 2)}\n`, "utf8");
}

export function stackFromRolls(rolls: Roll[], userId: string, plotSlug: string): BoomStackId | null {
  let stack: BoomStackId | null = null;
  for (const roll of rolls) {
    if (roll.status !== "active") continue;
    if (roll.userId !== userId) continue;
    if (roll.cadence !== "monthly") continue;
    if (roll.plotSlug && roll.plotSlug !== plotSlug) continue;
    const id = roll.presetId ? TOKEN_PRESETS[roll.presetId] : undefined;
    if (!id) continue;
    if (!stack || id > stack) stack = id;
  }
  return stack;
}

export function stackForPlot(rolls: Roll[], plotSlug: string): BoomStackId | null {
  let stack: BoomStackId | null = null;
  for (const roll of rolls) {
    if (roll.status !== "active") continue;
    if (roll.cadence !== "monthly") continue;
    if (roll.plotSlug !== plotSlug) continue;
    const id = roll.presetId ? TOKEN_PRESETS[roll.presetId] : undefined;
    if (!id) continue;
    if (!stack || id > stack) stack = id;
  }
  return stack;
}

export async function tokenCosts() {
  const s = await getSettings();
  return {
    grants: {
      1: s.tokenGrant1 ?? DEFAULT_TOKEN_GRANTS[1],
      2: s.tokenGrant2 ?? DEFAULT_TOKEN_GRANTS[2],
      3: s.tokenGrant3 ?? DEFAULT_TOKEN_GRANTS[3],
    } as Record<BoomStackId, number>,
    pingCost: s.tokenPingCost ?? DEFAULT_PING_COST,
    genCost: s.tokenGenCost ?? DEFAULT_GEN_COST,
  };
}

function findLedger(book: TokenBook, userId: string, plotSlug: string): TokenLedger | undefined {
  return book.ledgers.find((row) => row.userId === userId && row.plotSlug === plotSlug);
}

function pushEntry(row: TokenLedger, entry: Omit<TokenEntry, "id" | "t">) {
  const next: TokenEntry = {
    id: randomUUID(),
    t: nowIso(),
    ...entry,
  };
  row.entries.unshift(next);
  if (row.entries.length > 400) row.entries = row.entries.slice(0, 400);
  row.balance += entry.n;
  if (row.balance < 0) row.balance = 0;
}

export async function ledgerFor(
  user: PublicUser,
  plotSlug: string,
): Promise<TokenLedger | null> {
  if (!isStudio(user) && !user.plots.includes(plotSlug) && !user.plots.includes("*")) {
    return null;
  }
  const book = await readBook();
  return findLedger(book, user.id, plotSlug) || null;
}

export async function ledgersVisibleTo(user: PublicUser): Promise<TokenLedger[]> {
  const book = await readBook();
  if (isStudio(user)) return book.ledgers;
  return book.ledgers.filter(
    (row) => row.userId === user.id || user.plots.includes(row.plotSlug) || user.plots.includes("*"),
  );
}

export async function grantDueTokens(): Promise<number> {
  return serial(async () => {
    const rolls = await listRolls();
    const invoices = await listInvoices();
    const costs = await tokenCosts();
    const book = await readBook();
    const period = periodKey();
    let n = 0;
    const seen = new Set<string>();
    for (const roll of rolls) {
      if (roll.status !== "active" || roll.cadence !== "monthly") continue;
      const plotSlug = roll.plotSlug?.trim();
      if (!plotSlug) continue;
      const stack = stackFromRolls(rolls, roll.userId, plotSlug);
      if (!stack) continue;
      const key = `${roll.userId}|${plotSlug}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (await plotShutFor(plotSlug)) continue;
      const unpaid = invoices.some(
        (inv) =>
          inv.status === "due" &&
          inv.userId === roll.userId &&
          inv.lines.some((line) => line.plotSlug === plotSlug && !line.waived),
      );
      if (unpaid) continue;
      let row = findLedger(book, roll.userId, plotSlug);
      if (!row) {
        row = {
          id: randomUUID(),
          userId: roll.userId,
          plotSlug,
          stack,
          balance: 0,
          period: "",
          grantedThisPeriod: 0,
          entries: [],
        };
        book.ledgers.push(row);
      }
      row.stack = stack;
      if (row.period === period) continue;
      const grant = costs.grants[stack];
      row.period = period;
      row.grantedThisPeriod = grant;
      pushEntry(row, {
        k: "grant",
        n: grant,
        reason: `Stack ${stack} · ${period}`,
        by: "system",
      });
      n += 1;
    }
    if (n) await writeBook(book);
    return n;
  });
}

/** Drop-in debit for Send now (`ping`) and later generated packs (`gen`). */
export async function debitWell(input: {
  user: PublicUser;
  plotSlug: string;
  k: "ping" | "gen";
  reason: string;
  captureId?: string;
}): Promise<
  | { ok: true; balance: number; spent: number }
  | { ok: false; error: "balance" | "forbidden" | "shut" }
> {
  const costs = await tokenCosts();
  const n = input.k === "gen" ? costs.genCost : costs.pingCost;
  const spent = await spendTokens({
    user: input.user,
    plotSlug: input.plotSlug,
    n,
    k: input.k,
    reason: input.reason,
    captureId: input.captureId,
  });
  if (!spent.ok) return spent;
  return { ok: true, balance: spent.balance, spent: n };
}

export async function spendTokens(input: {
  user: PublicUser;
  plotSlug: string;
  n: number;
  k: Exclude<TokenReason, "grant">;
  reason: string;
  captureId?: string;
}): Promise<{ ok: true; balance: number } | { ok: false; error: "balance" | "forbidden" | "shut" }> {
  const plotSlug = input.plotSlug.trim();
  if (!plotSlug || input.n <= 0) return { ok: false, error: "forbidden" };
  if (!isStudio(input.user) && !input.user.plots.includes(plotSlug) && !input.user.plots.includes("*")) {
    return { ok: false, error: "forbidden" };
  }
  if (await plotShutFor(plotSlug)) return { ok: false, error: "shut" };
  return serial(async () => {
    const book = await readBook();
    const ownerId = isStudio(input.user) ? input.user.id : input.user.id;
    let row = findLedger(book, ownerId, plotSlug);
    const rolls = await listRolls();
    const stack = stackFromRolls(rolls, ownerId, plotSlug);
    if (!row) {
      if (!stack && !isStudio(input.user)) return { ok: false, error: "balance" };
      row = {
        id: randomUUID(),
        userId: ownerId,
        plotSlug,
        stack: stack || 1,
        balance: 0,
        period: periodKey(),
        grantedThisPeriod: 0,
        entries: [],
      };
      book.ledgers.push(row);
    }
    if (row.balance < input.n && !isStudio(input.user)) {
      return { ok: false, error: "balance" };
    }
    pushEntry(row, {
      k: input.k,
      n: -input.n,
      reason: input.reason,
      by: input.user.id,
      captureId: input.captureId,
    });
    await writeBook(book);
    return { ok: true, balance: row.balance };
  });
}

export async function adjustTokens(input: {
  actor: PublicUser;
  userId: string;
  plotSlug: string;
  n: number;
  reason: string;
}): Promise<TokenLedger | null> {
  if (!isStudio(input.actor)) return null;
  return serial(async () => {
    const book = await readBook();
    let row = findLedger(book, input.userId, input.plotSlug);
    if (!row) {
      row = {
        id: randomUUID(),
        userId: input.userId,
        plotSlug: input.plotSlug,
        stack: 1,
        balance: 0,
        period: periodKey(),
        grantedThisPeriod: 0,
        entries: [],
      };
      book.ledgers.push(row);
    }
    pushEntry(row, {
      k: "adjust",
      n: input.n,
      reason: input.reason.trim() || "desk",
      by: input.actor.id,
    });
    await writeBook(book);
    return row;
  });
}
