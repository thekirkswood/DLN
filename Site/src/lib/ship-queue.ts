import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), "..");
const SHIP_DIR = path.join(ROOT, "_meta", "ship");
const REQUEST = path.join(SHIP_DIR, "request.json");
const INBOX = path.join(ROOT, "_meta", "lab-inbox", "messages.json");
const WAKE = path.join(ROOT, "_meta", "lab-inbox", "wake.flag");

export const SHIP_PHRASE = {
  ship: "push to git and live",
  hotfix: "hotfix",
} as const;

export type ShipKind = keyof typeof SHIP_PHRASE;

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

export async function queueShip(input: {
  kind: ShipKind;
  confirm: string;
  notes: string;
  author: string;
  authorId: string;
}): Promise<{ id: string }> {
  const expect = SHIP_PHRASE[input.kind];
  if (input.confirm.trim().toLowerCase() !== expect) {
    throw new Error(`Type ${expect} to queue this. Send does not deploy.`);
  }
  const notes =
    input.notes.trim() ||
    (input.kind === "hotfix" ? "Hotfix" : "Push to git and live");
  await fs.mkdir(SHIP_DIR, { recursive: true });
  await fs.mkdir(path.dirname(INBOX), { recursive: true });
  const request = {
    kind: input.kind,
    confirm: expect,
    notes,
    requestedAt: new Date().toISOString(),
    requestedBy: input.author,
    requestedById: input.authorId,
  };
  await fs.writeFile(REQUEST, `${JSON.stringify(request, null, 2)}\n`, "utf8");
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
    text: notes,
    images: [],
    status: "pending",
    plot: "dln",
    page: "/",
    origin: "/account?desk=clock",
  };
  rows.unshift(message);
  await fs.writeFile(INBOX, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(
    WAKE,
    `${message.createdAt}\n${message.id}\n${message.kind}\n${message.plot}\n/\n${message.author}\n`,
    "utf8",
  );
  return { id: message.id };
}
