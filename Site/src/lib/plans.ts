import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isStudio, type PublicUser } from "@/lib/auth";

const ROOT = path.join(process.cwd(), "..", "_meta", "plans");
const COMMENTS = path.join(ROOT, "comments.json");
const PLANS = path.join(ROOT, "plans.json");

export type SiteComment = {
  id: string;
  /** The client this note belongs to. */
  userId: string;
  authorId: string;
  plotSlug: string;
  body: string;
  page?: string;
  createdAt: string;
  planId?: string;
  /** live = public well on the plot host. Not a live editor. */
  source?: "account" | "live" | "studio";
  fromName?: string;
};

export type BuildPlan = {
  id: string;
  userId: string;
  plotSlug: string;
  title: string;
  body: string;
  commentIds: string[];
  /** draft = swept, ready = Ewan will run it offline, shipped = uploaded. Never auto-deploys. */
  status: "draft" | "ready" | "shipped";
  patchNotes?: string;
  createdAt: string;
  updatedAt: string;
};

async function ensure() {
  await fs.mkdir(ROOT, { recursive: true });
  for (const file of [COMMENTS, PLANS]) {
    try {
      await fs.access(file);
    } catch {
      await fs.writeFile(file, "[]\n", "utf8");
    }
  }
}

async function readJson<T>(file: string): Promise<T[]> {
  await ensure();
  try {
    const parsed = JSON.parse(await fs.readFile(file, "utf8")) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeJson<T>(file: string, data: T[]) {
  await ensure();
  await fs.writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export async function listComments(): Promise<SiteComment[]> {
  return readJson<SiteComment>(COMMENTS);
}

export async function listPlans(): Promise<BuildPlan[]> {
  return readJson<BuildPlan>(PLANS);
}

export function canCommentOn(
  user: PublicUser,
  plotSlug: string,
): boolean {
  if (isStudio(user)) return true;
  return user.plots.includes(plotSlug) || user.plots.includes("*");
}

export async function commentsFor(
  user: PublicUser,
  plotSlug?: string,
): Promise<SiteComment[]> {
  const rows = await listComments();
  return rows.filter((c) => {
    if (plotSlug && c.plotSlug !== plotSlug) return false;
    if (isStudio(user)) return true;
    return c.userId === user.id || canCommentOn(user, c.plotSlug);
  });
}

export async function plansFor(
  user: PublicUser,
  plotSlug?: string,
): Promise<BuildPlan[]> {
  const rows = await listPlans();
  return rows.filter((p) => {
    if (plotSlug && p.plotSlug !== plotSlug) return false;
    if (isStudio(user)) return true;
    if (p.userId !== user.id && !canCommentOn(user, p.plotSlug)) return false;
    return p.status === "shipped";
  });
}

export async function addComment(
  user: PublicUser,
  input: { plotSlug?: string; body?: string; page?: string; clientId?: string },
): Promise<SiteComment> {
  const plotSlug = (input.plotSlug || "").trim();
  const body = (input.body || "").trim();
  if (!plotSlug || !body) throw new Error("invalid");
  if (!canCommentOn(user, plotSlug)) throw new Error("forbidden");
  const ownerId =
    isStudio(user) && input.clientId?.trim() ? input.clientId.trim() : user.id;
  if (!isStudio(user) && ownerId !== user.id) throw new Error("forbidden");
  const row: SiteComment = {
    id: randomUUID(),
    userId: ownerId,
    authorId: user.id,
    plotSlug,
    body,
    page: input.page?.trim() || undefined,
    createdAt: new Date().toISOString(),
    source: isStudio(user) ? "studio" : "account",
  };
  const rows = await listComments();
  rows.unshift(row);
  await writeJson(COMMENTS, rows);
  return row;
}

export async function addLiveSuggestion(input: {
  plotSlug?: string;
  body?: string;
  page?: string;
  fromName?: string;
}): Promise<SiteComment> {
  const { clientForPlot } = await import("@/lib/auth");
  const { plotBySlug } = await import("@/lib/plots");
  const plotSlug = (input.plotSlug || "").trim();
  const body = (input.body || "").trim();
  if (!plotSlug || !body) throw new Error("invalid");
  if (body.length > 2000) throw new Error("invalid");
  const plot = await plotBySlug(plotSlug);
  if (!plot || plot.party !== "client") throw new Error("forbidden");
  const owner = await clientForPlot(plotSlug);
  if (!owner) throw new Error("missing");
  const fromName = (input.fromName || "").trim().slice(0, 80) || undefined;
  const row: SiteComment = {
    id: randomUUID(),
    userId: owner.id,
    authorId: "live",
    plotSlug,
    body,
    page: input.page?.trim().slice(0, 160) || undefined,
    createdAt: new Date().toISOString(),
    source: "live",
    fromName,
  };
  const rows = await listComments();
  rows.unshift(row);
  await writeJson(COMMENTS, rows);
  return row;
}

function notesFromComments(comments: SiteComment[]): string {
  return comments
    .slice()
    .reverse()
    .map((c) => {
      const when = c.createdAt.slice(0, 10);
      const page = c.page ? ` (${c.page})` : "";
      const who = c.fromName ? ` ${c.fromName}` : "";
      const src = c.source === "live" ? " live" : "";
      return `— ${when}${src}${who}${page}: ${c.body}`;
    })
    .join("\n");
}

export async function sweepToPlan(
  studio: PublicUser,
  input: { userId?: string; plotSlug?: string },
): Promise<BuildPlan> {
  if (!isStudio(studio)) throw new Error("forbidden");
  const userId = (input.userId || "").trim();
  const plotSlug = (input.plotSlug || "").trim();
  if (!userId || !plotSlug) throw new Error("invalid");
  const comments = (await listComments()).filter(
    (c) => c.userId === userId && c.plotSlug === plotSlug && !c.planId,
  );
  if (!comments.length) throw new Error("empty");
  const now = new Date().toISOString();
  const plan: BuildPlan = {
    id: randomUUID(),
    userId,
    plotSlug,
    title: `Sweep ${now.slice(0, 10)}`,
    body: notesFromComments(comments),
    commentIds: comments.map((c) => c.id),
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
  const plans = await listPlans();
  plans.unshift(plan);
  await writeJson(PLANS, plans);
  const all = await listComments();
  for (const c of all) {
    if (plan.commentIds.includes(c.id)) c.planId = plan.id;
  }
  await writeJson(COMMENTS, all);
  return plan;
}

export async function savePlan(
  studio: PublicUser,
  input: { id?: string; title?: string; body?: string; patchNotes?: string },
): Promise<BuildPlan> {
  if (!isStudio(studio)) throw new Error("forbidden");
  const id = (input.id || "").trim();
  const plans = await listPlans();
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error("missing");
  if (input.title !== undefined) plan.title = input.title.trim() || plan.title;
  if (input.body !== undefined) plan.body = input.body;
  if (input.patchNotes !== undefined) plan.patchNotes = input.patchNotes.trim() || undefined;
  plan.updatedAt = new Date().toISOString();
  await writeJson(PLANS, plans);
  return plan;
}

export async function setPlanStatus(
  studio: PublicUser,
  input: { id?: string; status?: BuildPlan["status"] },
): Promise<BuildPlan> {
  if (!isStudio(studio)) throw new Error("forbidden");
  const id = (input.id || "").trim();
  const status = input.status;
  if (status !== "draft" && status !== "ready" && status !== "shipped") {
    throw new Error("invalid");
  }
  const plans = await listPlans();
  const plan = plans.find((p) => p.id === id);
  if (!plan) throw new Error("missing");
  plan.status = status;
  if (status === "shipped" && !plan.patchNotes) {
    plan.patchNotes = patchNotesFromPlan(plan);
  }
  plan.updatedAt = new Date().toISOString();
  await writeJson(PLANS, plans);
  return plan;
}

export function patchNotesFromPlan(plan: BuildPlan): string {
  const lines = plan.body
    .split("\n")
    .map((l) => l.replace(/^—\s+\d{4}-\d{2}-\d{2}(?:\s+\([^)]+\))?:\s*/, "").trim())
    .filter(Boolean);
  if (!lines.length) return "This update takes in the notes left on the live host.";
  return [
    "This update takes in the notes left on the live host, and a little more besides.",
    "",
    ...lines.map((l) => `• ${l}`),
  ].join("\n");
}
