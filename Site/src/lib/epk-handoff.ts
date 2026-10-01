import { createHmac } from "crypto";
import { promises as fs } from "fs";
import path from "path";

/** Bespoke plot press kits — hub gates, then hands off here. */
export const KIT_EXTERNAL_PRESS: Record<string, string> = {
  modyu: "https://modyu.designlabnorth.com",
};

async function readSecret(): Promise<string | null> {
  const fromEnv = process.env.EPK_HANDOFF_SECRET?.trim();
  if (fromEnv) return fromEnv;
  const candidates = [
    process.env.EPK_HANDOFF_SECRET_FILE?.trim(),
    path.join(process.cwd(), "..", "_meta", "epk", "handoff.secret"),
    "/home/main/_meta/epk-handoff.secret",
    "/srv/dln/data/epk-handoff.secret",
  ].filter(Boolean) as string[];
  for (const file of candidates) {
    try {
      const raw = (await fs.readFile(file, "utf8")).trim();
      if (raw) return raw;
    } catch {
      /* try next */
    }
  }
  return null;
}

export function kitExternalOrigin(kit: string): string | null {
  return KIT_EXTERNAL_PRESS[kit] || null;
}

/** Absolute handoff URL on the plot (sets epk_kit, then /epk). */
export async function kitHandoffHref(
  kit: string,
  nextPath = "/epk",
): Promise<string | null> {
  const origin = kitExternalOrigin(kit);
  if (!origin) return null;
  const secret = await readSecret();
  if (!secret) {
    // Still send them to the plot gate if secret missing
    return `${origin}/epk`;
  }
  const exp = Math.floor(Date.now() / 1000) + 300;
  const sig = createHmac("sha256", secret)
    .update(`${kit}:${exp}`)
    .digest("hex");
  const u = new URL("/api/epk/handoff", origin);
  u.searchParams.set("kit", kit);
  u.searchParams.set("exp", String(exp));
  u.searchParams.set("sig", sig);
  if (nextPath && nextPath.startsWith("/epk")) {
    u.searchParams.set("next", nextPath);
  }
  return u.toString();
}
