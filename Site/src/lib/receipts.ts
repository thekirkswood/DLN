import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { formatGbp } from "@/data/catalogue";
import type { Invoice, PayMethod } from "@/lib/billing";
import { formatLondonDate, londonYear, nowIso } from "@/lib/clock";
import { isStudio, type PublicUser } from "@/lib/auth";

const ROOT = path.join(process.cwd(), "..", "_meta", "billing");
const FILE = path.join(ROOT, "receipts.json");

export type Receipt = {
  id: string;
  number: string;
  invoiceId: string;
  invoiceNumber: string;
  userId: string;
  amountGbp: number;
  method: PayMethod;
  paidAt: string;
  lines: { description: string; amountGbp: number }[];
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]\n", "utf8");
  }
}

export async function listReceipts(): Promise<Receipt[]> {
  await ensure();
  try {
    const rows = JSON.parse(await fs.readFile(FILE, "utf8")) as Receipt[];
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function saveReceipts(rows: Receipt[]) {
  await ensure();
  await fs.writeFile(FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

async function nextReceiptNumber(existing: Receipt[]): Promise<string> {
  const year = londonYear();
  const prefix = `DLN-R-${year}-`;
  let max = 0;
  for (const row of existing) {
    if (!row.number?.startsWith(prefix)) continue;
    const n = parseInt(row.number.slice(prefix.length), 10);
    if (Number.isFinite(n) && n > max) max = n;
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export async function receiptById(id: string): Promise<Receipt | undefined> {
  return (await listReceipts()).find((r) => r.id === id);
}

export async function receiptForInvoice(invoiceId: string): Promise<Receipt | undefined> {
  return (await listReceipts()).find((r) => r.invoiceId === invoiceId);
}

export async function receiptsVisibleTo(user: PublicUser): Promise<Receipt[]> {
  const rows = await listReceipts();
  const visible = isStudio(user) ? rows : rows.filter((r) => r.userId === user.id);
  return visible.sort((a, b) => b.paidAt.localeCompare(a.paidAt));
}

export function canSeeReceipt(user: PublicUser, row: Receipt): boolean {
  if (isStudio(user)) return true;
  return row.userId === user.id;
}

export async function writeReceipt(inv: Invoice, method: PayMethod): Promise<Receipt> {
  const rows = await listReceipts();
  const existing = rows.find((r) => r.invoiceId === inv.id);
  if (existing) return existing;
  const row: Receipt = {
    id: randomUUID(),
    number: await nextReceiptNumber(rows),
    invoiceId: inv.id,
    invoiceNumber: inv.number,
    userId: inv.userId,
    amountGbp: inv.lines.reduce((sum, l) => sum + (l.waived ? 0 : l.amountGbp), 0),
    method,
    paidAt: inv.paidAt || nowIso(),
    lines: inv.lines
      .filter((l) => !l.waived)
      .map((l) => ({ description: l.description, amountGbp: l.waived ? 0 : l.amountGbp })),
  };
  rows.push(row);
  await saveReceipts(rows);
  return row;
}

export function receiptCopy(row: Receipt, who: string): string {
  const lines = row.lines
    .map((l) => `${l.description}  ${formatGbp(l.amountGbp)}`)
    .join("\n");
  return [
    "Design Lab North",
    `Receipt ${row.number}`,
    `Invoice ${row.invoiceNumber}`,
    who,
    `Paid ${formatLondonDate(row.paidAt)}`,
    `Method ${row.method === "online" ? "online" : row.method === "bank" ? "bank transfer" : "on the book"}`,
    "",
    lines,
    "",
    `Total ${formatGbp(row.amountGbp)}`,
  ].join("\n");
}
