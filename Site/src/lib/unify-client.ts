import { promises as fs } from "fs";
import path from "path";

const META = path.join(process.cwd(), "..", "_meta");

const JSON_FILES = [
  path.join(META, "billing", "invoices.json"),
  path.join(META, "billing", "subscriptions.json"),
  path.join(META, "billing", "payments.json"),
  path.join(META, "billing", "bookings.json"),
  path.join(META, "billing", "receipts.json"),
  path.join(META, "plans", "plans.json"),
  path.join(META, "plans", "comments.json"),
];

function rewriteIds(value: unknown, from: string, to: string): unknown {
  if (Array.isArray(value)) return value.map((row) => rewriteIds(row, from, to));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (
        (key === "userId" || key === "authorId" || key === "clientId") &&
        val === from
      ) {
        next[key] = to;
      } else {
        next[key] = rewriteIds(val, from, to);
      }
    }
    return next;
  }
  return value;
}

async function remapFile(file: string, from: string, to: string) {
  try {
    const raw = await fs.readFile(file, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    const next = rewriteIds(parsed, from, to);
    await fs.writeFile(file, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  } catch {
    /* missing store is fine */
  }
}

async function dropSessions(dropId: string) {
  const file = path.join(META, "accounts", "sessions.json");
  try {
    const rows = JSON.parse(await fs.readFile(file, "utf8")) as Array<{ userId?: string }>;
    if (!Array.isArray(rows)) return;
    await fs.writeFile(
      file,
      `${JSON.stringify(rows.filter((row) => row.userId !== dropId), null, 2)}\n`,
      "utf8",
    );
  } catch {
    /* no sessions yet */
  }
}

async function moveClientFolder(from: string, to: string) {
  const root = path.join(META, "clients");
  const src = path.join(root, from);
  const dest = path.join(root, to);
  try {
    await fs.access(src);
  } catch {
    return;
  }
  try {
    await fs.access(dest);
    const files = await fs.readdir(src);
    await fs.mkdir(dest, { recursive: true });
    for (const name of files) {
      await fs.rename(path.join(src, name), path.join(dest, `${from}-${name}`)).catch(() => undefined);
    }
    await fs.rm(src, { recursive: true, force: true });
  } catch {
    await fs.rename(src, dest).catch(() => undefined);
  }
}

/** Move records off an obsolete login onto the one we keep. */
export async function remapClientRecords(fromId: string, toId: string) {
  if (!fromId || !toId || fromId === toId) return;
  for (const file of JSON_FILES) await remapFile(file, fromId, toId);
  await dropSessions(fromId);
  await moveClientFolder(fromId, toId);
}
