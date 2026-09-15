import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import {
  BRAND_BITS_LEFT,
  BRAND_BITS_TOP,
  CAMPUS_NEUTRAL,
  DIVISIONS,
  divisionById,
  type DivisionId,
} from "@/data/campus";
import { canAccessPlot, clientForPlot, isStudio, type PublicUser } from "@/lib/auth";
import { invoicesVisibleTo } from "@/lib/billing";
import { commentsFor, plansFor } from "@/lib/plans";
import { clientPlots, enterUrlFor, plotBySlug, statusLabel } from "@/lib/plots";

const ROOT = path.join(process.cwd(), "..", "_meta", "boards");

export type BoardBit = {
  id: string;
  label: string;
  slot: "left" | "top";
  body: string;
};

export type BoardFeedback = {
  id: string;
  at: string;
  actor: "campus" | string;
  actorName: string;
  division?: DivisionId;
  colour: string;
  text: string;
  source: "form" | "mail" | "purchase" | "prompt";
  context?: string;
};

export type ExtraBit = { id: string; label: string };

export type BoardFile = {
  plot: string;
  bits: Record<string, string>;
  extraBits?: ExtraBit[];
  mailbox: { address: string } | null;
  feedback: BoardFeedback[];
};

export type BoardFunnelItem = {
  id: string;
  at: string;
  kind: "feedback" | "note" | "plan" | "invoice";
  title: string;
  how: string;
  colour: string;
  actorName: string;
  context?: string;
};

export type BoardView = {
  plot: string;
  plotName: string;
  hostUrl: string | null;
  status: string;
  bitsLeft: BoardBit[];
  bitsTop: BoardBit[];
  plans: { id: string; title: string; status: string; patchNotes?: string }[];
  notes: { id: string; body: string; at: string; page?: string }[];
  invoices: { id: string; number: string; status: string; issuedAt?: string }[];
  funnel: BoardFunnelItem[];
  mailbox: { address: string } | null;
  seat: { division: DivisionId; colour: string; label: string } | null;
};

function fileFor(plot: string) {
  return path.join(ROOT, `${plot}.json`);
}

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
}

function emptyFile(plot: string): BoardFile {
  return { plot, bits: {}, extraBits: [], mailbox: null, feedback: [] };
}

export async function readBoardFile(plot: string): Promise<BoardFile> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(fileFor(plot), "utf8")) as BoardFile;
    if (!parsed || parsed.plot !== plot) return emptyFile(plot);
    return {
      plot,
      bits: parsed.bits || {},
      extraBits: Array.isArray(parsed.extraBits) ? parsed.extraBits : [],
      mailbox: parsed.mailbox || null,
      feedback: Array.isArray(parsed.feedback) ? parsed.feedback : [],
    };
  } catch {
    return emptyFile(plot);
  }
}

async function writeBoardFile(row: BoardFile) {
  await ensure();
  const tmp = `${fileFor(row.plot)}.${process.pid}.tmp`;
  await fs.writeFile(tmp, `${JSON.stringify(row, null, 2)}\n`, "utf8");
  await fs.rename(tmp, fileFor(row.plot));
}

export async function plotForUser(user: PublicUser, want?: string): Promise<string | null> {
  const clients = await clientPlots();
  const allowed = clients.filter((p) => canAccessPlot(user, p.slug));
  if (want && allowed.some((p) => p.slug === want)) return want;
  return allowed[0]?.slug || null;
}

function seatOf(user: PublicUser, plot: string) {
  const hit = user.seats?.find((s) => s.plot === plot);
  if (!hit) return null;
  const div = divisionById(hit.division);
  if (!div) return null;
  return { division: div.id, colour: div.colour, label: div.label };
}

export async function boardView(user: PublicUser, plot: string): Promise<BoardView | null> {
  if (!canAccessPlot(user, plot)) return null;
  const meta = await plotBySlug(plot);
  if (!meta) return null;
  const file = await readBoardFile(plot);
  const bitsLeft: BoardBit[] = [
    ...BRAND_BITS_LEFT.map((b) => ({
      id: b.id,
      label: b.label,
      slot: "left" as const,
      body: file.bits[b.id] || "",
    })),
    ...(file.extraBits || []).map((b) => ({
      id: b.id,
      label: b.label,
      slot: "left" as const,
      body: file.bits[b.id] || "",
    })),
  ];
  const bitsTop: BoardBit[] = BRAND_BITS_TOP.map((b) => ({
    id: b.id,
    label: b.label,
    slot: "top",
    body: file.bits[b.id] || "",
  }));
  const comments = await commentsFor(user, plot);
  const plans = await plansFor(user, plot);
  const owner = await clientForPlot(plot);
  const invoices = (await invoicesVisibleTo(user)).filter((inv) => {
    if (inv.lines.some((l) => l.plotSlug === plot)) return true;
    if (owner && inv.userId === owner.id) return true;
    if (!isStudio(user) && inv.userId === user.id) return true;
    return false;
  });
  const funnel: BoardFunnelItem[] = [];
  for (const row of file.feedback) {
    funnel.push({
      id: row.id,
      at: row.at,
      kind: "feedback",
      title: row.text,
      how:
        row.source === "mail"
          ? "From the Host mailbox"
          : row.source === "purchase"
            ? "From a purchase on a hosted shop"
            : row.source === "prompt"
              ? "Prompt through branded profile"
              : "From the board form",
      colour: row.colour || CAMPUS_NEUTRAL,
      actorName: row.actorName,
      context: row.context,
    });
  }
  for (const note of comments) {
    funnel.push({
      id: `note-${note.id}`,
      at: note.createdAt,
      kind: "note",
      title: note.body,
      how: note.source === "live" ? "Suggestion on the live host" : "Note on the book",
      colour: CAMPUS_NEUTRAL,
      actorName: note.fromName || (note.source === "studio" ? "Design Lab North" : "Note"),
    });
  }
  for (const plan of plans) {
    funnel.push({
      id: `plan-${plan.id}`,
      at: plan.updatedAt || plan.createdAt,
      kind: "plan",
      title: plan.title,
      how:
        plan.status === "shipped"
          ? plan.patchNotes
            ? `Shipped. ${plan.patchNotes}`
            : "Shipped"
          : plan.status === "ready"
            ? "Ready to run"
            : "Draft on the book",
      colour: CAMPUS_NEUTRAL,
      actorName: "Design Lab North",
    });
  }
  for (const inv of invoices) {
    funnel.push({
      id: `inv-${inv.id}`,
      at: inv.paidAt || inv.issuedAt || "",
      kind: "invoice",
      title: `Invoice ${inv.number}`,
      how: inv.status === "paid" ? "Paid" : inv.status === "due" ? "Issued, due" : inv.status,
      colour: CAMPUS_NEUTRAL,
      actorName: "Design Lab North",
    });
  }
  funnel.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
  return {
    plot,
    plotName: meta.name,
    hostUrl: enterUrlFor(meta),
    status: statusLabel(meta),
    bitsLeft,
    bitsTop,
    plans: plans.map((p) => ({
      id: p.id,
      title: p.title,
      status: p.status,
      patchNotes: p.patchNotes,
    })),
    notes: comments.slice(0, 12).map((c) => ({
      id: c.id,
      body: c.body,
      at: c.createdAt,
      page: c.page,
    })),
    invoices: invoices.slice(0, 12).map((i) => ({
      id: i.id,
      number: i.number,
      status: i.status,
      issuedAt: i.issuedAt,
    })),
    funnel,
    mailbox: file.mailbox,
    seat: isStudio(user) ? null : seatOf(user, plot),
  };
}

function knownBitIds(file: BoardFile): Set<string> {
  return new Set([
    ...BRAND_BITS_LEFT.map((b) => b.id),
    ...BRAND_BITS_TOP.map((b) => b.id),
    ...(file.extraBits || []).map((b) => b.id),
  ]);
}

export function profileContext(file: BoardFile): string {
  const rows = [
    ...BRAND_BITS_LEFT.map((b) => ({ id: b.id, label: b.label })),
    ...(file.extraBits || []),
  ];
  return rows
    .map((b) => {
      const body = file.bits[b.id]?.trim();
      return body ? `${b.label}: ${body}` : "";
    })
    .filter(Boolean)
    .join("\n");
}

export async function saveBit(
  user: PublicUser,
  plot: string,
  id: string,
  body: string,
): Promise<BoardFile | null> {
  if (!canAccessPlot(user, plot)) return null;
  const file = await readBoardFile(plot);
  if (!knownBitIds(file).has(id)) return null;
  const text = body.trim();
  if (text) file.bits[id] = text;
  else delete file.bits[id];
  await writeBoardFile(file);
  return file;
}

export async function addInferenceBit(
  user: PublicUser,
  plot: string,
  label: string,
): Promise<BoardFile | null> {
  if (!canAccessPlot(user, plot)) return null;
  const name = label.trim().slice(0, 80);
  if (!name) return null;
  const file = await readBoardFile(plot);
  const id = `x-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)}`;
  if (!id || id === "x-") return null;
  if (knownBitIds(file).has(id)) return file;
  file.extraBits = [...(file.extraBits || []), { id, label: name }];
  await writeBoardFile(file);
  return file;
}

export async function addFeedback(
  user: PublicUser,
  plot: string,
  text: string,
  source: BoardFeedback["source"] = "form",
  context?: string,
): Promise<BoardFeedback | null> {
  if (!canAccessPlot(user, plot)) return null;
  const body = text.trim();
  if (!body) return null;
  const file = await readBoardFile(plot);
  const studio = isStudio(user);
  const seat = studio ? null : seatOf(user, plot);
  const row: BoardFeedback = {
    id: randomUUID(),
    at: new Date().toISOString(),
    actor: studio ? "campus" : user.id,
    actorName: studio ? "Design Lab North" : user.displayName,
    division: seat?.division,
    colour: studio ? CAMPUS_NEUTRAL : seat?.colour || DIVISIONS[0].colour,
    text: body,
    source,
    context: context?.trim() || undefined,
  };
  file.feedback.unshift(row);
  await writeBoardFile(file);
  return row;
}

export async function runBoardPrompt(
  user: PublicUser,
  plot: string,
  prompt: string,
): Promise<BoardFeedback | null> {
  if (!canAccessPlot(user, plot)) return null;
  const file = await readBoardFile(plot);
  const context = profileContext(file);
  return addFeedback(user, plot, prompt, "prompt", context);
}

export async function issueMailbox(
  user: PublicUser,
  plot: string,
): Promise<{ address: string } | null> {
  if (!isStudio(user) || !canAccessPlot(user, plot)) return null;
  const file = await readBoardFile(plot);
  if (!file.mailbox?.address) {
    file.mailbox = { address: `${plot}.host@designlabnorth.com` };
    await writeBoardFile(file);
  }
  return file.mailbox;
}
