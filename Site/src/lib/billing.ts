import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  type Cadence,
  type CatalogueItem,
  type TitlesGrant,
  catalogueById,
} from "@/data/catalogue";
import { isStudio, type PublicUser } from "@/lib/auth";

const ROOT = path.join(process.cwd(), "..", "_meta", "billing");
const INVOICES = path.join(ROOT, "invoices.json");
const ROLLS = path.join(ROOT, "subscriptions.json");

const GRACE_DAYS = 7;

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

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  for (const file of [INVOICES, ROLLS]) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, "[]\n", "utf8");
    }
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

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString();
}

function periodEnd(start: string, cadence: "weekly" | "monthly"): string {
  return cadence === "weekly" ? addDays(start, 7) : addMonths(start, 1);
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
  const year = new Date().getUTCFullYear();
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
  const now = inv.issuedAt || new Date().toISOString();
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
  const now = new Date().toISOString();
  inv.status = "due";
  inv.issuedAt = now;
  inv.dueAt = now;
  await saveInvoices(rows);
  await attachRolls(inv);
  if (inv.lines.length > 0 && inv.lines.every((l) => l.waived)) {
    inv.status = "paid";
    inv.paidAt = now;
    await saveInvoices(rows);
  }
  return inv;
}

export async function convertToTitles(
  actor: PublicUser,
  userId: string,
  grant: TitlesGrant,
  waived: boolean,
): Promise<Invoice> {
  const item = catalogueById(grant === "full" ? "titles-full" : "titles-section");
  if (!item) throw new Error("plan");
  const line = lineFromPreset(item, { waived, amountGbp: item.amountGbp });
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

export async function payInvoice(user: PublicUser, invoiceId: string): Promise<Invoice> {
  const rows = await listInvoices();
  const inv = rows.find((i) => i.id === invoiceId);
  if (!inv) throw new Error("missing");
  const allowed = inv.userId === user.id || isStudio(user);
  if (!allowed) throw new Error("forbidden");
  if (inv.status !== "due") throw new Error("state");
  inv.status = "paid";
  inv.paidAt = new Date().toISOString();
  await saveInvoices(rows);
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
    }
  }
  if (!changed) return;
  await saveInvoices(invoices);
  await writeJson(ROLLS, rolls);
}

export function graceEndsAt(inv: Invoice): string | null {
  if (inv.status !== "due") return null;
  const start = inv.dueAt || inv.issuedAt;
  if (!start) return null;
  return addDays(start, GRACE_DAYS);
}

export async function plotShutFor(slug: string): Promise<boolean> {
  const now = Date.now();
  const rows = await listInvoices();
  return rows.some((inv) => {
    if (inv.status !== "due") return false;
    if (!plotSlugsOnInvoice(inv).includes(slug)) return false;
    const ends = graceEndsAt(inv);
    if (!ends) return false;
    return new Date(ends).getTime() <= now;
  });
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

export { catalogueById };
