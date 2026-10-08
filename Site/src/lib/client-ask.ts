import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), "..");
const INBOX = path.join(ROOT, "_meta", "lab-inbox", "messages.json");
const WAKE = path.join(ROOT, "_meta", "lab-inbox", "wake.flag");

type InboxRow = {
  id: string;
  createdAt: string;
  author: string;
  authorId: string;
  kind: string;
  text: string;
  images: string[];
  status: string;
  plot: string;
  page?: string;
  origin: string;
};

/**
 * Wake the lab with a client ask. Never kind "hotfix" or "ship" —
 * those deploy. A client hotfix is a note we audit first.
 */
export async function wakeClientAsk(input: {
  kind: "note" | "hotfix-ask";
  text: string;
  author: string;
  authorId: string;
  plot: string;
  page?: string;
  origin: string;
}): Promise<{ id: string }> {
  await fs.mkdir(path.dirname(INBOX), { recursive: true });
  let rows: InboxRow[] = [];
  try {
    const parsed = JSON.parse(await fs.readFile(INBOX, "utf8")) as InboxRow[];
    rows = Array.isArray(parsed) ? parsed : [];
  } catch {
    rows = [];
  }
  const message: InboxRow = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    author: input.author,
    authorId: input.authorId,
    kind: input.kind,
    text: input.text,
    images: [],
    status: "pending",
    plot: input.plot,
    page: input.page,
    origin: input.origin,
  };
  rows.unshift(message);
  await fs.writeFile(INBOX, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(
    WAKE,
    `${message.createdAt}\n${message.id}\n${message.kind}\n${message.plot}\n${input.page || "/"}\n${message.author}\n`,
    "utf8",
  );
  return { id: message.id };
}
