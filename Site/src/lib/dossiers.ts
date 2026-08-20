import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ROOT = path.join(process.cwd(), "..", "_meta", "clients");

export type DossierStage = "apes" | "design" | "strategy" | "build" | "titles";

export type DossierResource = {
  id: string;
  stage: DossierStage;
  title: string;
  url?: string;
  note?: string;
  createdAt: string;
};

export type Dossier = {
  userId: string;
  who: string;
  resources: DossierResource[];
};

function fileFor(userId: string): string {
  return path.join(ROOT, `${userId}.json`);
}

async function ensureDir() {
  await fs.mkdir(ROOT, { recursive: true });
}

export async function getDossier(userId: string): Promise<Dossier> {
  await ensureDir();
  try {
    const parsed = JSON.parse(await fs.readFile(fileFor(userId), "utf8")) as Dossier;
    if (parsed && parsed.userId === userId && Array.isArray(parsed.resources)) {
      return {
        userId,
        who: parsed.who || "",
        resources: parsed.resources,
      };
    }
  } catch {
    /* empty */
  }
  return { userId, who: "", resources: [] };
}

async function save(row: Dossier) {
  await ensureDir();
  await fs.writeFile(fileFor(row.userId), `${JSON.stringify(row, null, 2)}\n`, "utf8");
}

export async function saveDossierWho(userId: string, who: string): Promise<Dossier> {
  const row = await getDossier(userId);
  row.who = who.trim();
  await save(row);
  return row;
}

export async function addDossierResource(
  userId: string,
  input: { stage: DossierStage; title: string; url?: string; note?: string },
): Promise<Dossier> {
  const title = input.title.trim();
  if (!title) throw new Error("invalid");
  const stages: DossierStage[] = ["apes", "design", "strategy", "build", "titles"];
  if (!stages.includes(input.stage)) throw new Error("invalid");
  const row = await getDossier(userId);
  row.resources.unshift({
    id: randomUUID(),
    stage: input.stage,
    title,
    url: input.url?.trim() || undefined,
    note: input.note?.trim() || undefined,
    createdAt: new Date().toISOString(),
  });
  await save(row);
  return row;
}

export async function removeDossierResource(userId: string, resourceId: string): Promise<Dossier> {
  const row = await getDossier(userId);
  row.resources = row.resources.filter((r) => r.id !== resourceId);
  await save(row);
  return row;
}
