import { promises as fs } from "fs";
import path from "path";
import { isWatchTapPath, recordEdgeHit } from "@/lib/watch";

const LOG = process.env.DLN_CADDY_ACCESS_LOG || "/var/log/caddy/access.json";
const CURSOR = path.join(process.cwd(), "..", "_meta", "studio", "watch-edge-cursor.json");
const MAX_CHUNK = 2 * 1024 * 1024;

type Cursor = { file: string; size: number };

type CaddyLine = {
  ts?: number;
  status?: number;
  request?: {
    remote_ip?: string;
    client_ip?: string;
    host?: string;
    uri?: string;
    headers?: Record<string, string[] | string | undefined>;
  };
};

let chain: Promise<unknown> = Promise.resolve();

function serial<T>(fn: () => Promise<T>): Promise<T> {
  const run = chain.then(fn, fn);
  chain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function headerOne(
  headers: Record<string, string[] | string | undefined> | undefined,
  names: string[],
): string {
  if (!headers) return "";
  for (const name of names) {
    const raw = headers[name];
    const value = Array.isArray(raw) ? raw[0] || "" : raw || "";
    if (value) return value;
  }
  return "";
}

function headerUa(headers?: Record<string, string[] | string | undefined>): string {
  return headerOne(headers, ["User-Agent", "user-agent"]);
}

function isoFromTs(ts?: number): string | undefined {
  if (!ts || !Number.isFinite(ts)) return undefined;
  const ms = ts > 1e12 ? ts : ts * 1000;
  return new Date(ms).toISOString();
}

async function readCursor(): Promise<Cursor> {
  try {
    const parsed = JSON.parse(await fs.readFile(CURSOR, "utf8")) as Cursor;
    if (parsed && typeof parsed.size === "number") return parsed;
  } catch {
    /* first pass */
  }
  return { file: LOG, size: 0 };
}

async function writeCursor(cur: Cursor) {
  await fs.mkdir(path.dirname(CURSOR), { recursive: true });
  await fs.writeFile(CURSOR, `${JSON.stringify(cur)}\n`, "utf8");
}

export async function ingestCaddyLog(): Promise<{ lines: number; kept: number }> {
  return serial(async () => {
    let stat: { size: number };
    try {
      stat = await fs.stat(LOG);
    } catch {
      return { lines: 0, kept: 0 };
    }
    const cur = await readCursor();
    let start = cur.file === LOG ? cur.size : 0;
    if (start > stat.size) start = 0;
    if (stat.size - start > MAX_CHUNK) start = Math.max(0, stat.size - MAX_CHUNK);
    if (start >= stat.size) return { lines: 0, kept: 0 };

    const fh = await fs.open(LOG, "r");
    const buf = Buffer.alloc(stat.size - start);
    await fh.read(buf, 0, buf.length, start);
    await fh.close();
    await writeCursor({ file: LOG, size: stat.size });

    const text = buf.toString("utf8");
    const rows = text.split("\n").filter((l) => l.trim().startsWith("{"));
    let kept = 0;
    for (const line of rows) {
      let row: CaddyLine;
      try {
        row = JSON.parse(line) as CaddyLine;
      } catch {
        continue;
      }
      const host = (row.request?.host || "").split(":")[0];
      const uri = row.request?.uri || "";
      const pathName = uri.split("?")[0];
      if (!host || !pathName) continue;
      if (!isWatchTapPath(pathName)) continue;
      const ip = (row.request?.client_ip || row.request?.remote_ip || "").slice(0, 64);
      if (!ip) continue;
      const ok = await recordEdgeHit({
        ip,
        host,
        path: pathName,
        ua: headerUa(row.request?.headers).slice(0, 300),
        t: isoFromTs(row.ts),
        from: headerOne(row.request?.headers, ["Referer", "Referrer", "referer"]).slice(0, 160),
      });
      if (ok) kept += 1;
    }
    return { lines: rows.length, kept };
  });
}
