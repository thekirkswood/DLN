import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "..", "_meta", "site-log");

export type SiteLogLine = { t: string; s: string };

function fileOf(slug: string) {
  return path.join(ROOT, `${slug}.jsonl`);
}

export async function appendSiteLog(
  slug: string,
  s: string,
  t = new Date().toISOString(),
): Promise<void> {
  const note = s.trim();
  if (!/^[a-z0-9-]+$/i.test(slug) || !note) return;
  await fs.mkdir(ROOT, { recursive: true });
  await fs.appendFile(
    fileOf(slug),
    `${JSON.stringify({ t, s: note })}\n`,
    "utf8",
  );
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
      .reverse();
  } catch {
    return [];
  }
}
