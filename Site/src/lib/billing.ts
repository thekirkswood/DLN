import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  CATALOGUE,
  bookableForFacet,
  type Cadence,
  type CatalogueItem,
  type Stage,
  type TitlesGrant,
} from "@/data/catalogue";
import { isStudio, type PublicUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import {
  addCalendarDays,
  GRACE_DAYS,
  londonYear,
  nowIso,
  periodEnd as clockPeriodEnd,
} from "@/lib/clock";

const ROOT = path.join(process.cwd(), "..", "_meta", "billing");
const INVOICES = path.join(ROOT, "invoices.json");
const ROLLS = path.join(ROOT, "subscriptions.json");
const PRICES = path.join(ROOT, "prices.json");
const RAIL = path.join(ROOT, "rail.json");
const ONLINE = path.join(ROOT, "online.json");
const PAYMENTS = path.join(ROOT, "payments.json");

export type ExtraCharge = {
  id: string;
  stage: Stage;
  name: string;
  amountGbp: number;
};

const EXTRAS = path.join(ROOT, "extras.json");

export type PriceBook = Record<string, number>;

export type PayRail = {
  accountName: string;
  sortCode: string;
  accountNumber: string;
  bankName: string;
  extra: string;
};

export type PayMethod = "bank" | "studio" | "online";

export type Payment = {
  id: string;
  invoiceId: string;
  amountGbp: number;
  method: PayMethod;
  reference: string;
  status: "claimed" | "cleared";
  claimedAt?: string;
  claimedBy?: string;
  clearedAt?: string;
  clearedBy?: string;
};

export type Line = {
  id: string;
  description: string;
  amountGbp: number;
  waived: boolean;
  presetId?: string;
  cadence?: Cadence;
  plotSlug?: string;
  titlesGrant?: TitlesGrant;
};

export type InvoiceStatus = "draft" | "due" | "paid" | "void";

export type Invoice = {
  id: string;
  number: string;
  userId: string;
  status: InvoiceStatus;
  issuedAt?: string;
  dueAt?: string;
  paidAt?: string;
  lines: Line[];
  notes?: string;
};

export type Roll = {
  id: string;
  userId: string;
  invoiceId: string;
  cadence: "weekly" | "monthly";
  plotSlug?: string;
  description: string;
  amountGbp: number;
  waived: boolean;
  presetId?: string;
  titlesGrant?: TitlesGrant;
  status: "active" | "paused";
  currentPeriodStart: string;
  currentPeriodEnd: string;
};

type LegacyInvoice = Invoice & {
  plotSlug?: string;
  amountGbp?: number;
  cadence?: Cadence;
  subscriptionId?: string;
};

const EMPTY_RAIL: PayRail = {
  accountName: "",
  sortCode: "",
  accountNumber: "",
  bankName: "",
  extra: "",
};

export type OnlineRail = {
  provider: "none" | "stripe";
  autoHost: boolean;
  note: string;
};

const EMPTY_ONLINE: OnlineRail = {
  provider: "none",
  autoHost: true,
  note: "",
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  for (const file of [INVOICES, ROLLS, PAYMENTS]) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, "[]\n", "utf8");
    }
  }
  try {
    await fs.access(PRICES);
  } catch {
    await fs.writeFile(PRICES, "{}\n", "utf8");
  }
  try {
    await fs.access(RAIL);
  } catch {
    await fs.writeFile(RAIL, `${JSON.stringify(EMPTY_RAIL, null, 2)}\n`, "utf8");
  }
  try {
    await fs.access(ONLINE);
  } catch {
    await fs.writeFile(ONLINE, `${JSON.stringify(EMPTY_ONLINE, null, 2)}\n`, "utf8");
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]) {
  await ensure();
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function asPrice(n: unknown): number | null {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v) || v < 0) return null;
  return v;
}

function asExtra(raw: unknown): ExtraCharge | null {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const id = typeof row.id === "string" ? row.id.trim() : "";
  const name = typeof row.name === "string" ? row.name.trim() : "";
  const stage = row.stage;
  const amountGbp = asPrice(row.amountGbp);
  if (!id || !name || amountGbp === null) return null;
  if (stage !== "design" && stage !== "strategy" && stage !== "build") return null;
  return { id, stage, name, amountGbp };
}

export async function listExtras(): Promise<ExtraCharge[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(EXTRAS, "utf8")) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map(asExtra).filter((row): row is ExtraCharge => Boolean(row));
  } catch {
    return [];
  }
}

export async function saveExtras(
  actor: PublicUser,
  rows: ExtraCharge[],
): Promise<ExtraCharge[]> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const next = rows.map(asExtra).filter((row): row is ExtraCharge => Boolean(row));
  await ensure();
  await fs.writeFile(EXTRAS, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return next;
}

function extraAsItem(row: ExtraCharge): CatalogueItem {
  return {
    id: row.id,
    stage: row.stage,
    name: row.name,
    blurb: "Other — unique to this situation.",
    amountGbp: row.amountGbp,
    cadence: "once",
    custom: true,
  };
}

export async function liveCatalogue(): Promise<CatalogueItem[]> {
  await ensure();
  let overlay: PriceBook = {};
  try {
    const parsed = JSON.parse(await fs.readFile(PRICES, "utf8")) as PriceBook;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) overlay = parsed;
  } catch {
    overlay = {};
  }
  const stock = CATALOGUE.map((item) => {
    const next = asPrice(overlay[item.id]);
    return next === null ? item : { ...item, amountGbp: next };
  });
  const extras = (await listExtras()).map(extraAsItem);
  return [...stock, ...extras];
}

export async function savePrices(actor: PublicUser, book: PriceBook): Promise<CatalogueItem[]> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const next: PriceBook = {};
  for (const item of CATALOGUE) {
    const v = asPrice(book[item.id]);
    if (v !== null) next[item.id] = v;
  }
  await ensure();
  await fs.writeFile(PRICES, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  return liveCatalogue();
}

function asRail(raw: unknown): PayRail {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    accountName: typeof row.accountName === "string" ? row.accountName.trim() : "",
    sortCode: typeof row.sortCode === "string" ? row.sortCode.trim() : "",
    accountNumber: typeof row.accountNumber === "string" ? row.accountNumber.trim() : "",
    bankName: typeof row.bankName === "string" ? row.bankName.trim() : "",
    extra: typeof row.extra === "string" ? row.extra.trim() : "",
  };
}

export async function getPayRail(): Promise<PayRail> {
  await ensure();
  try {
    return asRail(JSON.parse(await fs.readFile(RAIL, "utf8")));
  } catch {
    return { ...EMPTY_RAIL };
  }
}

export function railIsReady(rail: PayRail): boolean {
  return Boolean(rail.accountName && rail.sortCode && rail.accountNumber);
}

export async function savePayRail(actor: PublicUser, body: Partial<PayRail>): Promise<PayRail> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const rail = asRail(body);
  await ensure();
  await fs.writeFile(RAIL, `${JSON.stringify(rail, null, 2)}\n`, "utf8");
  return rail;
}

function asOnline(raw: unknown): OnlineRail {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    provider: row.provider === "stripe" ? "stripe" : "none",
    autoHost: row.autoHost !== false,
    note: typeof row.note === "string" ? row.note.trim() : "",
  };
}

export async function getOnlineRail(): Promise<OnlineRail> {
  await ensure();
  try {
    return asOnline(JSON.parse(await fs.readFile(ONLINE, "utf8")));
  } catch {
    return { ...EMPTY_ONLINE };
  }
}

export function onlineProviderLive(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function saveOnlineRail(
  actor: PublicUser,
  body: Partial<OnlineRail>,
): Promise<OnlineRail> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const rail = asOnline({ ...(await getOnlineRail()), ...body });
  await ensure();
  await fs.writeFile(ONLINE, `${JSON.stringify(rail, null, 2)}\n`, "utf8");
  return rail;
}

export async function listPayments(): Promise<Payment[]> {
  return readJson<Payment>(PAYMENTS);
}

async function savePayments(rows: Payment[]) {
  await writeJson(PAYMENTS, rows);
}

export async function paymentByInvoice(): Promise<Record<string, Payment>> {
  const rows = await listPayments();
  const out: Record<string, Payment> = {};
  for (const row of rows) {
    const prev = out[row.invoiceId];
    if (!prev) {
      out[row.invoiceId] = row;
      continue;
    }
    const a = row.clearedAt || row.claimedAt || "";
    const b = prev.clearedAt || prev.claimedAt || "";
    if (a >= b) out[row.invoiceId] = row;
  }
  return out;
}

function periodEnd(start: string, cadence: "weekly" | "monthly"): string {
  return clockPeriodEnd(start, cadence);
}

function normaliseInvoice(raw: LegacyInvoice): Invoice {
  if (Array.isArray(raw.lines) && raw.lines.length) {
    return {
      id: raw.id,
      number: raw.number,
      userId: raw.userId,
      status: raw.status === "draft" || raw.status === "void" || raw.status === "paid" ? raw.status : "due",
      issuedAt: raw.issuedAt,
      dueAt: raw.dueAt || raw.issuedAt,
      paidAt: raw.paidAt,
      lines: raw.lines,
      notes: raw.notes,
    };
  }
  const amount = typeof raw.amountGbp === "number" ? raw.amountGbp : 0;
  return {
    id: raw.id,
    number: raw.number,
    userId: raw.userId,
    status: raw.status === "paid" ? "paid" : raw.status === "void" ? "void" : "due",
    issuedAt: raw.issuedAt,
    dueAt: raw.dueAt || raw.issuedAt,
    paidAt: raw.paidAt,
    lines: [
      {
        id: raw.id,
        description: raw.plotSlug ? `Hosting · ${raw.plotSlug}` : "Plan",
        amountGbp: amount,
        waived: false,
        cadence: raw.cadence,
        plotSlug: raw.plotSlug,
      },
    ],
  };
}

async function nextInvoiceNumber(existing: Invoice[]): Promise<string> {
  const year = londonYear();
  const prefix = `DLN-${year}-`;
  let max = 0;
  for (const inv of existing) {
    if (!inv.number?.startsWith(prefix)) continue;
    const n = parseInt(inv.number.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function lineTotal(line: Line): number {
  return line.waived ? 0 : line.amountGbp;
}

export function invoiceTotal(inv: Invoice): number {
  return inv.lines.reduce((sum, line) => sum + lineTotal(line), 0);
}

export function plotSlugsOnInvoice(inv: Invoice): string[] {
  return Array.from(
    new Set(inv.lines.map((l) => l.plotSlug).filter((s): s is string => Boolean(s))),
  );
}

export async function listInvoices(): Promise<Invoice[]> {
  const rows = await readJson<LegacyInvoice>(INVOICES);
  return rows.map(normaliseInvoice);
}

async function saveInvoices(rows: Invoice[]) {
  await writeJson(INVOICES, rows);
}

export async function listRolls(): Promise<Roll[]> {
  return readJson<Roll>(ROLLS);
}

export async function invoiceById(id: string): Promise<Invoice | undefined> {
  return (await listInvoices()).find((i) => i.id === id);
}

export async function invoicesVisibleTo(user: PublicUser): Promise<Invoice[]> {
  const rows = await listInvoices();
  const visible = isStudio(user)
    ? rows
    : rows.filter((i) => i.userId === user.id && i.status !== "draft");
  return visible.sort((a, b) => {
    const at = a.issuedAt || a.number;
    const bt = b.issuedAt || b.number;
    return bt.localeCompare(at);
  });
}

export function canSeeInvoice(user: PublicUser, inv: Invoice): boolean {
  if (isStudio(user)) return true;
  return inv.userId === user.id && inv.status !== "draft";
}

type LineInput = {
  id?: string;
  description?: string;
  amountGbp?: number;
  waived?: boolean;
  presetId?: string;
  cadence?: string;
  plotSlug?: string;
  titlesGrant?: string;
};

function asLines(input: LineInput[]): Line[] {
  return input
    .map((row) => {
      const description = (row.description || "").trim();
      const amountGbp = Number(row.amountGbp);
      if (!description || !Number.isFinite(amountGbp) || amountGbp < 0) return null;
      const cadence =
        row.cadence === "weekly" || row.cadence === "monthly" || row.cadence === "once"
          ? row.cadence
          : "once";
      const line: Line = {
        id: row.id || randomUUID(),
        description,
        amountGbp,
        waived: Boolean(row.waived),
        cadence,
      };
      if (row.presetId) line.presetId = row.presetId;
      if (row.plotSlug) line.plotSlug = row.plotSlug.trim();
      if (row.titlesGrant === "section" || row.titlesGrant === "full") {
        line.titlesGrant = row.titlesGrant;
      }
      return line;
    })
    .filter((x): x is Line => Boolean(x));
}

export function lineFromPreset(
  item: CatalogueItem,
  extras?: { plotSlug?: string; amountGbp?: number; waived?: boolean },
): Line {
  const amount = extras?.amountGbp ?? item.amountGbp;
  const line: Line = {
    id: randomUUID(),
    description: item.name,
    amountGbp: amount,
    waived: Boolean(extras?.waived),
    presetId: item.id,
    cadence: item.cadence,
  };
  if (extras?.plotSlug) line.plotSlug = extras.plotSlug;
  if (item.titlesGrant) line.titlesGrant = item.titlesGrant;
  return line;
}

export async function saveDraft(
  actor: PublicUser,
  body: {
    id?: string;
    userId: string;
    lines: Array<{
      id?: string;
      description?: string;
      amountGbp?: number;
      waived?: boolean;
      presetId?: string;
      cadence?: string;
      plotSlug?: string;
      titlesGrant?: string;
    }>;
    notes?: string;
  },
): Promise<Invoice> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const lines = asLines(body.lines);
  if (!lines.length) throw new Error("lines");
  const userId = body.userId.trim();
  if (!userId) throw new Error("user");
  const rows = await listInvoices();
  const notes = body.notes?.trim() || undefined;
  if (body.id) {
    const inv = rows.find((i) => i.id === body.id);
    if (!inv) throw new Error("missing");
    if (inv.status !== "draft") throw new Error("state");
    inv.userId = userId;
    inv.lines = lines;
    inv.notes = notes;
    await saveInvoices(rows);
    return inv;
  }
  const inv: Invoice = {
    id: randomUUID(),
    number: await nextInvoiceNumber(rows),
    userId,
    status: "draft",
    lines,
    notes,
  };
  rows.push(inv);
  await saveInvoices(rows);
  return inv;
}

async function attachRolls(inv: Invoice) {
  const rolls = await listRolls();
  const now = inv.issuedAt || nowIso();
  for (const line of inv.lines) {
    if (line.cadence !== "weekly" && line.cadence !== "monthly") continue;
    const existing = rolls.find(
      (r) =>
        r.status === "active" &&
        r.userId === inv.userId &&
        r.cadence === line.cadence &&
        (r.plotSlug || "") === (line.plotSlug || "") &&
        r.presetId === line.presetId,
    );
    if (existing) existing.status = "paused";
    rolls.push({
      id: randomUUID(),
      userId: inv.userId,
      invoiceId: inv.id,
      cadence: line.cadence,
      plotSlug: line.plotSlug,
      description: line.description,
      amountGbp: line.amountGbp,
      waived: line.waived,
      presetId: line.presetId,
      titlesGrant: line.titlesGrant,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd(now, line.cadence),
    });
  }
  await writeJson(ROLLS, rolls);
}

export async function issueInvoice(actor: PublicUser, id: string): Promise<Invoice> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const rows = await listInvoices();
  const inv = rows.find((i) => i.id === id);
  if (!inv) throw new Error("missing");
  if (inv.status !== "draft") throw new Error("state");
  const now = nowIso();
  inv.status = "due";
  inv.issuedAt = now;
  inv.dueAt = now;
  await saveInvoices(rows);
  await attachRolls(inv);
  if (inv.lines.length > 0 && inv.lines.every((l) => l.waived)) {
    inv.status = "paid";
    inv.paidAt = now;
    await saveInvoices(rows);
    const { writeReceipt } = await import("@/lib/receipts");
    await writeReceipt(inv, "studio");
  }
  return inv;
}

export async function buySession(user: PublicUser, facet: Stage): Promise<Invoice> {
  const item = (await liveCatalogue()).find((c) => c.bookable && c.stage === facet) || bookableForFacet(facet);
  if (!item) throw new Error("plan");
  const amountGbp = item.amountGbp;
  if (amountGbp <= 0) throw new Error("amount");
  const open = (await listInvoices()).find(
    (inv) =>
      inv.userId === user.id &&
      inv.status === "due" &&
      inv.lines.some((l) => l.presetId === item.id),
  );
  if (open) return open;
  const line = lineFromPreset(item, { amountGbp });
  const rows = await listInvoices();
  const now = nowIso();
  const inv: Invoice = {
    id: randomUUID(),
    number: await nextInvoiceNumber(rows),
    userId: user.id,
    status: "due",
    issuedAt: now,
    dueAt: now,
    lines: [line],
    notes: `Sitting · ${facet}. Pay, then pick a time.`,
  };
  rows.push(inv);
  await saveInvoices(rows);
  return inv;
}

async function markCollected(inv: Invoice, method: PayMethod, by: string): Promise<void> {
  const now = nowIso();
  const amount = invoiceTotal(inv);
  const payments = await listPayments();
  payments.push({
    id: randomUUID(),
    invoiceId: inv.id,
    amountGbp: amount,
    method,
    reference: inv.number,
    status: "cleared",
    clearedAt: now,
    clearedBy: by,
  });
  inv.status = "paid";
  inv.paidAt = now;
  await savePayments(payments);
  const { writeReceipt } = await import("@/lib/receipts");
  await writeReceipt(inv, method);
}

export async function tryAutoCollect(inv: Invoice): Promise<boolean> {
  if (inv.status !== "due") return false;
  const amount = invoiceTotal(inv);
  if (amount <= 0) {
    await markCollected(inv, "studio", "system");
    return true;
  }
  const online = await getOnlineRail();
  if (!online.autoHost) return false;
  if (!onlineProviderLive()) return false;
  return false;
}

export async function convertToTitles(
  actor: PublicUser,
  userId: string,
  grant: TitlesGrant,
  waived: boolean,
): Promise<Invoice> {
  const items = await liveCatalogue();
  const item = items.find((c) => c.id === (grant === "full" ? "titles-full" : "titles-section"));
  if (!item) throw new Error("plan");
  const line = lineFromPreset(item, {
    waived,
    amountGbp: item.amountGbp,
  });
  const draft = await saveDraft(actor, {
    userId,
    lines: [line],
    notes: "Various Titles — billed on the Design Lab North book.",
  });
  return issueInvoice(actor, draft.id);
}

export async function voidInvoice(actor: PublicUser, id: string): Promise<Invoice> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const rows = await listInvoices();
  const inv = rows.find((i) => i.id === id);
  if (!inv) throw new Error("missing");
  if (inv.status === "paid") throw new Error("state");
  inv.status = "void";
  await saveInvoices(rows);
  return inv;
}

export async function paymentsFor(invoiceId: string): Promise<Payment[]> {
  return (await listPayments()).filter((p) => p.invoiceId === invoiceId);
}

export async function claimPayment(user: PublicUser, invoiceId: string): Promise<Invoice> {
  const rows = await listInvoices();
  const inv = rows.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("missing");
  const allowed = inv.userId === user.id || isStudio(user);
  if (!allowed) throw new Error("forbidden");
  if (inv.status !== "due") throw new Error("state");
  const amount = invoiceTotal(inv);
  if (amount <= 0) throw new Error("state");
  const payments = await listPayments();
  const existing = payments.find((p) => p.invoiceId === inv.id && p.status === "claimed");
  if (existing) return inv;
  payments.push({
    id: randomUUID(),
    invoiceId: inv.id,
    amountGbp: amount,
    method: "bank",
    reference: inv.number,
    status: "claimed",
    claimedAt: nowIso(),
    claimedBy: user.id,
  });
  await savePayments(payments);
  return inv;
}

export async function clearPayment(
  user: PublicUser,
  invoiceId: string,
  method: PayMethod = "studio",
): Promise<Invoice> {
  if (!isStudio(user)) throw new Error("forbidden");
  const rows = await listInvoices();
  const inv = rows.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("missing");
  if (inv.status !== "due") throw new Error("state");
  const now = nowIso();
  const amount = invoiceTotal(inv);
  const payments = await listPayments();
  const claimed = payments.find((p) => p.invoiceId === inv.id && p.status === "claimed");
  const payMethod: PayMethod = method === "online" || method === "bank" ? method : claimed?.method || "studio";
  if (claimed) {
    claimed.status = "cleared";
    claimed.method = payMethod;
    claimed.clearedAt = now;
    claimed.clearedBy = user.id;
  } else {
    payments.push({
      id: randomUUID(),
      invoiceId: inv.id,
      amountGbp: amount,
      method: payMethod,
      reference: inv.number,
      status: "cleared",
      clearedAt: now,
      clearedBy: user.id,
    });
  }
  inv.status = "paid";
  inv.paidAt = now;
  await savePayments(payments);
  await saveInvoices(rows);
  const { writeReceipt } = await import("@/lib/receipts");
  await writeReceipt(inv, payMethod);
  return inv;
}

export async function rollDueInvoices(): Promise<void> {
  const rolls = await listRolls();
  const invoices = await listInvoices();
  const now = Date.now();
  let changed = false;
  for (const roll of rolls) {
    if (roll.status !== "active") continue;
    if (roll.cadence !== "weekly" && roll.cadence !== "monthly") continue;
    while (new Date(roll.currentPeriodEnd).getTime() <= now) {
      const start = roll.currentPeriodEnd;
      const end = periodEnd(start, roll.cadence);
      const issued = start;
      const inv: Invoice = {
        id: randomUUID(),
        number: await nextInvoiceNumber(invoices),
        userId: roll.userId,
        status: "due",
        issuedAt: issued,
        dueAt: issued,
        lines: [
          {
            id: randomUUID(),
            description: roll.description,
            amountGbp: roll.amountGbp,
            waived: roll.waived,
            presetId: roll.presetId,
            cadence: roll.cadence,
            plotSlug: roll.plotSlug,
            titlesGrant: roll.titlesGrant,
          },
        ],
      };
      invoices.push(inv);
      roll.currentPeriodStart = start;
      roll.currentPeriodEnd = end;
      changed = true;
      await tryAutoCollect(inv);
    }
  }
  if (!changed) return;
  await saveInvoices(invoices);
  await writeJson(ROLLS, rolls);
}

export async function graceEndsAt(inv: Invoice): Promise<string | null> {
  if (inv.status !== "due") return null;
  const start = inv.dueAt || inv.issuedAt;
  if (!start) return null;
  const days = (await getSettings()).graceDays || GRACE_DAYS;
  return addCalendarDays(start, days);
}

export async function plotShutFor(slug: string): Promise<boolean> {
  const now = Date.now();
  const rows = await listInvoices();
  for (const inv of rows) {
    if (inv.status !== "due") continue;
    if (!plotSlugsOnInvoice(inv).includes(slug)) continue;
    const ends = await graceEndsAt(inv);
    if (!ends) continue;
    if (new Date(ends).getTime() <= now) return true;
  }
  return false;
}

export type TitlesAccess = {
  grant: TitlesGrant | null;
  paying: boolean;
  pendingInvoiceId?: string;
};

export async function titlesAccessFor(user: PublicUser): Promise<TitlesAccess> {
  if (isStudio(user)) return { grant: "full", paying: true };
  const rows = await listInvoices();
  let grant: TitlesGrant | null = null;
  let paying = false;
  let pendingInvoiceId: string | undefined;
  for (const inv of rows) {
    if (inv.userId !== user.id) continue;
    const titles = inv.lines.filter((l) => l.titlesGrant);
    if (!titles.length) continue;
    if (inv.status === "paid") {
      paying = true;
      for (const line of titles) {
        if (line.titlesGrant === "full") grant = "full";
        else if (grant !== "full") grant = "section";
      }
    } else if (inv.status === "due" && !pendingInvoiceId) {
      pendingInvoiceId = inv.id;
    }
  }
  return { grant, paying, pendingInvoiceId };
}

