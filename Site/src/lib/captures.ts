import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isStudio, type PublicUser } from "@/lib/auth";
import { nowIso } from "@/lib/clock";
import { wakeClientAsk } from "@/lib/client-ask";
import { debitWell } from "@/lib/tokens";

const ROOT = path.join(process.cwd(), "..", "_meta", "captures");
const BOOK = path.join(ROOT, "book.json");
const FILES = path.join(ROOT, "files");

const MAX_FILE = 12 * 1024 * 1024;
const MAX_FILES = 8;
const ALLOWED = new Set([
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/html",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export type CapturePace = "sweep" | "now";
export type CaptureKind = "brief" | "document" | "picture" | "mixed";
export type CaptureStatus = "open" | "working" | "done";

export type CaptureFile = {
  name: string;
  type: string;
  bytes: number;
  rel: string;
};

export type Capture = {
  id: string;
  t: string;
  userId: string;
  authorId: string;
  plotSlug: string;
  kind: CaptureKind;
  text: string;
  files: CaptureFile[];
  pace: CapturePace;
  tokensSpent: number;
  status: CaptureStatus;
  inboxId?: string;
};

type CaptureBook = { rows: Capture[] };

function guessKind(text: string, files: CaptureFile[]): CaptureKind {
  const pics = files.filter((f) => f.type.startsWith("image/"));
  const docs = files.filter((f) => !f.type.startsWith("image/"));
  if (pics.length && !docs.length && !text.trim()) return "picture";
  if (docs.length && !pics.length) return "document";
  if (text.trim() && !files.length) return "brief";
  return "mixed";
}

async function readBook(): Promise<CaptureBook> {
  try {
    const parsed = JSON.parse(await fs.readFile(BOOK, "utf8")) as CaptureBook;
    if (parsed && Array.isArray(parsed.rows)) return parsed;
  } catch {
    /* empty */
  }
  return { rows: [] };
}

async function writeBook(book: CaptureBook) {
  await fs.mkdir(ROOT, { recursive: true });
  await fs.writeFile(BOOK, `${JSON.stringify(book, null, 2)}\n`, "utf8");
}

export async function listCaptures(user: PublicUser, plotSlug?: string): Promise<Capture[]> {
  const book = await readBook();
  return book.rows.filter((row) => {
    if (plotSlug && row.plotSlug !== plotSlug) return false;
    if (isStudio(user)) return true;
    return row.userId === user.id || user.plots.includes(row.plotSlug) || user.plots.includes("*");
  });
}

export async function addCapture(
  user: PublicUser,
  input: {
    plotSlug: string;
    text: string;
    pace: CapturePace;
    files: { name: string; type: string; buf: Buffer }[];
  },
): Promise<Capture> {
  const plotSlug = input.plotSlug.trim();
  const text = input.text.trim();
  if (!plotSlug) throw new Error("invalid");
  if (!isStudio(user) && !user.plots.includes(plotSlug) && !user.plots.includes("*")) {
    throw new Error("forbidden");
  }
  if (!text && !input.files.length) throw new Error("invalid");
  if (input.files.length > MAX_FILES) throw new Error("too-many");

  const id = randomUUID();
  const saved: CaptureFile[] = [];
  for (const file of input.files) {
    const type = (file.type || "application/octet-stream").slice(0, 80);
    if (!ALLOWED.has(type) && !file.name.match(/\.(pdf|txt|md|html?|png|jpe?g|webp|gif|svg|docx?)$/i)) {
      throw new Error("type");
    }
    if (file.buf.length > MAX_FILE) throw new Error("too-big");
    const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(0, 80) || "file";
    const rel = path.join(id, safe);
    await fs.mkdir(path.join(FILES, id), { recursive: true });
    await fs.writeFile(path.join(FILES, rel), file.buf);
    saved.push({ name: file.name.slice(0, 120), type, bytes: file.buf.length, rel });
  }

  const pace: CapturePace = input.pace === "now" ? "now" : "sweep";
  let tokensSpent = 0;
  let inboxId: string | undefined;
  if (pace === "now") {
    const spent = await debitWell({
      user,
      plotSlug,
      k: "ping",
      reason: "Send now",
      captureId: id,
    });
    if (!spent.ok) throw new Error(spent.error);
    tokensSpent = spent.spent;
    const wake = await wakeClientAsk({
      kind: "note",
      text: `Send now · ${plotSlug}\n${text || "(files)"}`.slice(0, 8000),
      author: user.displayName || user.id,
      authorId: user.id,
      plot: plotSlug,
      origin: "/account",
    });
    inboxId = wake.id;
  }

  const row: Capture = {
    id,
    t: nowIso(),
    userId: user.id,
    authorId: user.id,
    plotSlug,
    kind: guessKind(text, saved),
    text,
    files: saved,
    pace,
    tokensSpent,
    status: "open",
    inboxId,
  };
  const book = await readBook();
  book.rows.unshift(row);
  await writeBook(book);
  return row;
}

export function captureFileAbs(rel: string): string {
  return path.join(FILES, rel);
}
