import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { resolveHouse, type LabHouse } from "@/lib/lab";

export type LabKind = "change" | "plan" | "note";

export type LabMessage = {
  id: string;
  createdAt: string;
  author: string;
  authorId: string;
  kind: LabKind;
  text: string;
  images: string[];
  status: "pending" | "working" | "done" | "error";
  reply?: string;
  repliedAt?: string;
  plot: string;
  page?: string;
  origin: string;
};

function roots(house: LabHouse) {
  const dir = path.join(house.housePath, house.inboxRel);
  return {
    dir,
    messages: path.join(dir, "messages.json"),
    wake: path.join(dir, "wake.flag"),
  };
}

async function ensure(house: LabHouse): Promise<boolean> {
  const { dir, messages, wake } = roots(house);
  try {
    await fs.mkdir(dir, { recursive: true });
    try {
      await fs.access(messages);
    } catch {
      await fs.writeFile(messages, "[]\n", "utf8");
    }
    try {
      await fs.access(wake);
    } catch {
      await fs.writeFile(wake, "", "utf8");
    }
    return true;
  } catch {
    return false;
  }
}

export async function ensureHouseInbox(slug: string): Promise<boolean> {
  const house = await resolveHouse(slug);
  if (!house) return false;
  return ensure(house);
}

export async function primeAllHouseInboxes(): Promise<void> {
  const { allLabHouses } = await import("@/lib/lab");
  const houses = await allLabHouses();
  await Promise.all(houses.map((h) => ensure(h)));
}

export async function listLabMessages(slug: string): Promise<LabMessage[]> {
  const house = await resolveHouse(slug);
  if (!house) return [];
  await ensure(house);
  try {
    const parsed = JSON.parse(
      await fs.readFile(roots(house).messages, "utf8"),
    ) as LabMessage[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function addLabMessage(input: {
  plot: string;
  author: string;
  authorId: string;
  kind: LabKind;
  text: string;
  page?: string;
  origin: string;
  images?: string[];
}): Promise<LabMessage> {
  const house = await resolveHouse(input.plot);
  if (!house) throw new Error("unknown house");
  if (!(await ensure(house))) throw new Error("inbox unavailable");
  const { messages: file, wake } = roots(house);
  const rows = await listLabMessages(input.plot);
  const message: LabMessage = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    author: input.author.trim() || "Studio",
    authorId: input.authorId,
    kind: input.kind,
    text: input.text.trim(),
    images: input.images || [],
    status: "pending",
    plot: input.plot,
    page: input.page?.trim() || undefined,
    origin: input.origin,
  };
  rows.push(message);
  await fs.writeFile(file, `${JSON.stringify(rows, null, 2)}\n`, "utf8");
  await fs.writeFile(
    wake,
    `${message.createdAt}\n${message.id}\n${message.kind}\n${message.plot}\n${message.page || "/"}\n${message.author}\n`,
    "utf8",
  );
  if (input.plot === "dln") {
    spawn("/home/main/DLN/ops/push-lab-inbox.sh", [], {
      detached: true,
      stdio: "ignore",
    }).unref();
  }
  return message;
}

export async function setLabMessageStatus(
  slug: string,
  id: string,
  status: LabMessage["status"],
): Promise<LabMessage | null> {
  const house = await resolveHouse(slug);
  if (!house) return null;
  const rows = await listLabMessages(slug);
  const hit = rows.find((m) => m.id === id);
  if (!hit) return null;
  hit.status = status;
  await fs.writeFile(
    roots(house).messages,
    `${JSON.stringify(rows, null, 2)}\n`,
    "utf8",
  );
  return hit;
}

const IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
]);

function uploadName(file: Blob): string {
  if ("name" in file && typeof file.name === "string") return file.name;
  return "";
}

function extForUpload(file: Blob): string | null {
  const type = file.type || "";
  if (IMAGE_TYPES.has(type) || type.startsWith("image/")) {
    if (type === "image/png") return "png";
    if (type === "image/webp") return "webp";
    if (type === "image/gif") return "gif";
    return "jpg";
  }
  const name = uploadName(file).toLowerCase();
  if (/\.png$/.test(name)) return "png";
  if (/\.jpe?g$/.test(name)) return "jpg";
  if (/\.webp$/.test(name)) return "webp";
  if (/\.gif$/.test(name)) return "gif";
  return null;
}

export async function saveLabUploads(
  slug: string,
  files: Blob[],
): Promise<string[]> {
  const house = await resolveHouse(slug);
  if (!house) return [];
  if (!(await ensure(house))) return [];
  const dir = path.join(roots(house).dir, "uploads");
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {
    return [];
  }
  const urls: string[] = [];
  for (const file of files) {
    const ext = extForUpload(file);
    if (!ext) continue;
    const name = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dir, name), buf);
    urls.push(`/api/lab/file?plot=${encodeURIComponent(slug)}&name=${encodeURIComponent(name)}`);
  }
  return urls;
}

export async function readLabUpload(
  slug: string,
  name: string,
): Promise<{ buf: Buffer; type: string } | null> {
  const house = await resolveHouse(slug);
  if (!house) return null;
  const safe = path.basename(name);
  if (!safe || safe !== name) return null;
  const full = path.join(roots(house).dir, "uploads", safe);
  try {
    const buf = await fs.readFile(full);
    const ext = path.extname(safe).toLowerCase();
    const type =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
          ? "image/webp"
          : ext === ".gif"
            ? "image/gif"
            : "image/jpeg";
    return { buf, type };
  } catch {
    return null;
  }
}

export async function replyLabMessage(
  slug: string,
  id: string,
  reply: string,
  status: LabMessage["status"] = "done",
): Promise<LabMessage | null> {
  const house = await resolveHouse(slug);
  if (!house) return null;
  const rows = await listLabMessages(slug);
  const hit = rows.find((m) => m.id === id);
  if (!hit) return null;
  hit.reply = reply;
  hit.repliedAt = new Date().toISOString();
  hit.status = status;
  await fs.writeFile(
    roots(house).messages,
    `${JSON.stringify(rows, null, 2)}\n`,
    "utf8",
  );
  return hit;
}
