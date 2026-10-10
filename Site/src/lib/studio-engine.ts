import { promises as fs } from "fs";
import path from "path";
import { addUploadedAsset, patchAsset } from "@/lib/assets";
import { vaultKitForPlot } from "@/lib/epk-map";
import {
  getStudioProject,
  projectSlug,
  updateStudioProject,
} from "@/lib/studio-projects";
import { studioEngineHref } from "@/lib/studio-hub";

export async function engineJson<T>(
  tail: string,
  host: string | null,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; data: T }> {
  const href = studioEngineHref(tail, host);
  const res = await fetch(href, init);
  const data = (await res.json().catch(() => ({}))) as T;
  return { ok: res.ok, status: res.status, data };
}

export async function ensureProjectSpace(opts: {
  projectId: string;
  plotName?: string;
  host: string | null;
}) {
  const project = await getStudioProject(opts.projectId);
  if (!project) throw new Error("Project missing");
  if (project.workspaceSlug && project.sandboxSlug) {
    const space = await engineJson<{ sandbox?: { id?: string } }>(
      `/api/space?w=${encodeURIComponent(project.workspaceSlug)}&s=${encodeURIComponent(project.sandboxSlug)}`,
      opts.host,
    );
    if (space.ok && space.data.sandbox?.id) {
      return {
        sandboxId: space.data.sandbox.id,
        workspaceSlug: project.workspaceSlug,
        sandboxSlug: project.sandboxSlug,
      };
    }
  }
  const created = await engineJson<{
    workspace?: { slug?: string };
    sandbox?: { id?: string; slug?: string };
  }>("/api/spaces", opts.host, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: projectSlug(project.plotSlug, project.title),
      brandTokens: {
        product: opts.plotName || project.plotSlug,
        tone: "quiet, tactile, cinematic",
      },
    }),
  });
  const sandboxId = created.data.sandbox?.id;
  const workspaceSlug = created.data.workspace?.slug || "";
  const sandboxSlug = created.data.sandbox?.slug || "";
  if (!created.ok || !sandboxId || !workspaceSlug || !sandboxSlug) {
    throw new Error("Studio gen is not running on this seat.");
  }
  await updateStudioProject(project.id, { workspaceSlug, sandboxSlug });
  return { sandboxId, workspaceSlug, sandboxSlug };
}

export async function bytesFromHref(href: string, host: string | null): Promise<Buffer | null> {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    const disk = path.join(process.cwd(), "public", trimmed.replace(/^\//, ""));
    try {
      return await fs.readFile(disk);
    } catch {
      /* fetch below */
    }
  }
  const url = trimmed.startsWith("http") ? trimmed : studioEngineHref(trimmed, host);
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}

export async function depositStudioFile(opts: {
  plotSlug: string;
  filename: string;
  bytes: Buffer;
  title: string;
  note?: string;
}) {
  const kit = vaultKitForPlot(opts.plotSlug) || opts.plotSlug;
  const item = await addUploadedAsset({
    kit,
    filename: opts.filename,
    bytes: opts.bytes,
  });
  if (!item) return null;
  return patchAsset({
    id: item.id,
    title: opts.title,
    note: opts.note,
  });
}
