import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { needById, offerById } from "@/data/needs";
import { sendStudioMail } from "@/lib/mail";

const ROOT = path.join(process.cwd(), "..", "_meta", "enquiries");
const FILE = path.join(ROOT, "enquiries.json");

export type EnquiryMsg = {
  id: string;
  t: string;
  from: "visitor" | "campus";
  text: string;
  mailed?: boolean;
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  needId: string;
  facet: string;
  needLabel: string;
  message?: string;
  scale?: "sole-trader" | "bigger-business" | "corporation";
  hereFor?: string[];
  lines?: string[];
  access?: string;
  createdAt: string;
  updatedAt?: string;
  status: "composing" | "new" | "closed" | "onboarded";
  thread?: EnquiryMsg[];
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
  scale?: string;
  hereFor?: string[];
  lines?: string[];
  access?: string;
}): Promise<Enquiry> {
  const name = (input.name || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim() || undefined;
  const message = (input.message || "").trim() || undefined;
  const need = needById((input.needId || "").trim());
  if (!name || !validEmail(email) || !need) throw new Error("invalid");
  const facet = offerById(need.facet)?.name || need.facet;
  const scale =
    input.scale === "sole-trader" ||
    input.scale === "bigger-business" ||
    input.scale === "corporation"
      ? input.scale
      : undefined;
  const hereFor = Array.isArray(input.hereFor)
    ? input.hereFor.map((id) => String(id).trim()).filter(Boolean)
    : undefined;
  const lines = Array.isArray(input.lines)
    ? input.lines.map((id) => String(id).trim()).filter(Boolean)
    : undefined;
  const access = (input.access || "").trim() || undefined;
  const row: Enquiry = {
    id: randomUUID(),
    name,
    email,
    phone,
    needId: need.id,
    facet,
    needLabel: need.label,
    message,
    scale,
    hereFor,
    lines,
    access,
    createdAt: new Date().toISOString(),
    status: "new",
    thread: [
      {
        id: randomUUID(),
        t: new Date().toISOString(),
        from: "campus",
        text: "Someone will get back to you. You will receive an email when they do.",
      },
    ],
  };
  const rows = await listEnquiries();
  rows.unshift(row);
  await save(rows);
  await notifyStudio(row).catch(() => undefined);
  return row;
}

export async function upsertDraft(input: {
  id?: string;
  name?: string;
  email?: string;
  phone?: string;
  needId?: string;
  message?: string;
}): Promise<Enquiry> {
  const rows = await listEnquiries();
  const id = (input.id || "").trim();
  let row = id
    ? rows.find((r) => r.id === id && r.status === "composing")
    : undefined;
  const need = needById((input.needId || "").trim());
  const name = (input.name || "").trim();
  const email = (input.email || "").trim().toLowerCase();
  const phone = (input.phone || "").trim() || undefined;
  const message = (input.message || "").trim() || undefined;
  const now = new Date().toISOString();
  if (!row) {
    row = {
      id: randomUUID(),
      name,
      email,
      phone,
      needId: need?.id || "",
      facet: need ? offerById(need.facet)?.name || need.facet : "",
      needLabel: need?.label || "",
      message,
      createdAt: now,
      updatedAt: now,
      status: "composing",
    };
    rows.unshift(row);
  } else {
    if (name) row.name = name;
    if (email) row.email = email;
    row.phone = phone;
    row.message = message;
    if (need) {
      row.needId = need.id;
      row.facet = offerById(need.facet)?.name || need.facet;
      row.needLabel = need.label;
    }
    row.updatedAt = now;
  }
  await save(rows);
  return row;
}

export async function sendDraft(id: string): Promise<Enquiry> {
  const rows = await listEnquiries();
  const row = rows.find((r) => r.id === id);
  if (!row || row.status !== "composing") throw new Error("missing");
  const need = needById(row.needId);
  if (!row.name.trim() || !validEmail(row.email) || !need) throw new Error("invalid");
  row.status = "new";
  row.updatedAt = new Date().toISOString();
  await save(rows);
  await notifyStudio(row).catch(() => undefined);
  return row;
}

export async function updateEnquiry(
  id: string,
  patch: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  },
): Promise<Enquiry> {
  const rows = await listEnquiries();
  const row = rows.find((r) => r.id === id);
  if (!row) throw new Error("missing");
  const name = (patch.name ?? row.name).trim();
  const email = (patch.email ?? row.email).trim().toLowerCase();
  const phone = (patch.phone ?? row.phone ?? "").trim();
  const message = (patch.message ?? row.message ?? "").trim();
  if (!name || !validEmail(email)) throw new Error("invalid");
  row.name = name;
  row.email = email;
  row.phone = phone || undefined;
  row.message = message || undefined;
  await save(rows);
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

function seedThread(row: Enquiry): EnquiryMsg[] {
  if (row.thread?.length) return row.thread;
  return [
    {
      id: randomUUID(),
      t: row.createdAt,
      from: "campus",
      text: "Someone will get back to you. You will receive an email when they do.",
    },
  ];
}

export async function addEnquiryMessage(input: {
  id: string;
  from: "visitor" | "campus";
  text: string;
  email?: string;
}): Promise<Enquiry> {
  const text = input.text.trim().slice(0, 2000);
  if (!text) throw new Error("empty");
  const rows = await listEnquiries();
  const row = rows.find((r) => r.id === input.id);
  if (!row) throw new Error("missing");
  if (input.from === "visitor") {
    const mail = (input.email || "").trim().toLowerCase();
    if (!mail || mail !== row.email.toLowerCase()) throw new Error("email");
  }
  row.thread = seedThread(row);
  const msg: EnquiryMsg = {
    id: randomUUID(),
    t: new Date().toISOString(),
    from: input.from,
    text,
  };
  if (input.from === "campus") {
    const mailed = await sendStudioMail({
      to: row.email,
      subject: "Design Lab North — a reply on your enquiry",
      text: `${text}\n\n— Design Lab North`,
    });
    msg.mailed = mailed;
  }
  row.thread.push(msg);
  row.updatedAt = msg.t;
  await save(rows);
  if (input.from === "visitor") {
    const { addNotice } = await import("@/lib/notices");
    await addNotice({
      kind: "onboard",
      title: `${row.name} wrote in onboarding`,
      body: text,
      email: row.email,
      important: false,
    });
  }
  return row;
}
