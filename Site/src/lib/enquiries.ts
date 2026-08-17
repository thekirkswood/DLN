import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { needById, offerById } from "@/data/needs";
import { sendStudioMail } from "@/lib/mail";

const ROOT = path.join(process.cwd(), "..", "_meta", "enquiries");
const FILE = path.join(ROOT, "enquiries.json");

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  needId: string;
  facet: string;
  needLabel: string;
  message?: string;
  createdAt: string;
  status: "new" | "closed" | "onboarded";
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  try {
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]\n", "utf8");
  }
}

export async function listEnquiries(): Promise<Enquiry[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(FILE, "utf8")) as Enquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function save(rows: Enquiry[]) {
  await ensure();
  await fs.writeFile(FILE, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || value.endsWith(".local");
}

export async function createEnquiry(input: {
  name?: string;
  email?: string;
  phone?: string;
  needId?: string;
  message?: string;
}): Promise<Enquiry> {
  const name = (input.name || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim() || undefined;
  const message = (input.message || "").trim() || undefined;
  const need = needById((input.needId || "").trim());
  if (!name || !validEmail(email) || !need) throw new Error("invalid");
  const facet = offerById(need.facet)?.name || need.facet;
  const row: Enquiry = {
    id: randomUUID(),
    name,
    email,
    phone,
    needId: need.id,
    facet,
    needLabel: need.label,
    message,
    createdAt: new Date().toISOString(),
    status: "new",
  };
  const rows = await listEnquiries();
  rows.unshift(row);
  await save(rows);
  await notifyStudio(row).catch(() => undefined);
  return row;
}

export async function enquiryById(id: string): Promise<Enquiry | undefined> {
  return (await listEnquiries()).find((r) => r.id === id);
}

export async function closeEnquiry(id: string): Promise<Enquiry> {
  return setEnquiryStatus(id, "closed");
}

export async function markEnquiryOnboarded(id: string): Promise<Enquiry> {
  return setEnquiryStatus(id, "onboarded");
}

async function setEnquiryStatus(
  id: string,
  status: Enquiry["status"],
): Promise<Enquiry> {
  const rows = await listEnquiries();
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error("missing");
  row.status = status;
  await save(rows);
  return row;
}

async function notifyStudio(row: Enquiry) {
  const to = process.env.DLN_ENQUIRE_TO?.trim() || "build@designlabnorth.com";
  const lines = [
    `${row.name} <${row.email}>`,
    row.phone ? `Phone: ${row.phone}` : "",
    `${row.facet}: ${row.needLabel}`,
    row.message || "",
    `https://designlabnorth.com/account`,
  ].filter(Boolean);
  await sendStudioMail({
    to,
    replyTo: row.email,
    subject: `Enquiry · ${row.facet} · ${row.name}`,
    text: lines.join("\n"),
  });
}
