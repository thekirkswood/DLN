import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "..", "_meta", "site-log");
export const SITE_LOG_KEEP = 16;

export type SiteLogLine = { t: string; s: string; lines?: string[] };

function fileOf(slug: string) {
  return path.join(ROOT, `${slug}.jsonl`);
}

export async function appendSiteLog(
  slug: string,
  s: string,
  t = new Date().toISOString(),
  lines?: string[],
): Promise<void> {
  const note = s.trim();
  if (!/^[a-z0-9-]+$/i.test(slug) || !note) return;
  const row: SiteLogLine = { t, s: note };
  const clean = (lines || []).map((line) => line.trim()).filter(Boolean);
  if (clean.length) row.lines = clean;
  await fs.mkdir(ROOT, { recursive: true });
  await fs.appendFile(fileOf(slug), `${JSON.stringify(row)}\n`, "utf8");
}

export async function readSiteLog(slug: string): Promise<SiteLogLine[]> {
  if (!/^[a-z0-9-]+$/i.test(slug)) return [];
  try {
    const raw = await fs.readFile(fileOf(slug), "utf8");
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as SiteLogLine)
      .filter((row) => row && typeof row.t === "string" && typeof row.s === "string")
      .map((row) => ({
        t: row.t,
        s: row.s,
        lines: Array.isArray(row.lines)
          ? row.lines.filter((line) => typeof line === "string" && line.trim())
          : undefined,
      }))
      .reverse();
  } catch {
    return [];
  }
}

export function capturePatchCopy(input: {
  page?: string;
  files: number;
  pace: "sweep" | "now";
}): { s: string; lines: string[] } | null {
  if (input.pace !== "now" && input.files < 1) return null;
  const on = input.page ? `On ${input.page}.` : "On this site.";
  if (input.files) {
    return {
      s: "Received new documents. In development.",
      lines: [
        on,
        input.files === 1 ? "One file received." : `${input.files} files received.`,
        "Assessed against the live application.",
      ],
    };
  }
  return {
    s: "Received a note. In development.",
    lines: [on],
  };
}
