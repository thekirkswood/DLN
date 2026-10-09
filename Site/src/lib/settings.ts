import { promises as fs } from "fs";
import path from "path";
import { isStudio, type PublicUser } from "@/lib/auth";

const FILE = path.join(process.cwd(), "..", "_meta", "studio", "settings.json");

export type StudioSettings = {
  /** Days after due before a bound site shuts. */
  graceDays: number;
  /** Dave’s Adobe Fonts / Typekit web project id. Not a secret. */
  adobeKit: string;
  /** Monthly token grant per BoomStack. Desk overlay. */
  tokenGrant1: number;
  tokenGrant2: number;
  tokenGrant3: number;
  /** Send now / forced ping. */
  tokenPingCost: number;
  /** Pictures, clips, written packs from our system — same well. */
  tokenGenCost: number;
};

export const DEFAULT_SETTINGS: StudioSettings = {
  graceDays: 7,
  adobeKit: "",
  tokenGrant1: 40,
  tokenGrant2: 100,
  tokenGrant3: 250,
  tokenPingCost: 8,
  tokenGenCost: 12,
};

function asSettings(raw: unknown): StudioSettings {
  const row = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const days = Number(row.graceDays);
  const kit = typeof row.adobeKit === "string" ? row.adobeKit.trim() : "";
  const grant = (key: string, fallback: number) => {
    const n = Number(row[key]);
    return Number.isInteger(n) && n >= 0 && n <= 5000 ? n : fallback;
  };
  return {
    graceDays:
      Number.isInteger(days) && days >= 1 && days <= 90 ? days : DEFAULT_SETTINGS.graceDays,
    adobeKit: /^[a-z0-9]{5,12}$/i.test(kit) ? kit : "",
    tokenGrant1: grant("tokenGrant1", DEFAULT_SETTINGS.tokenGrant1),
    tokenGrant2: grant("tokenGrant2", DEFAULT_SETTINGS.tokenGrant2),
    tokenGrant3: grant("tokenGrant3", DEFAULT_SETTINGS.tokenGrant3),
    tokenPingCost: grant("tokenPingCost", DEFAULT_SETTINGS.tokenPingCost),
    tokenGenCost: grant("tokenGenCost", DEFAULT_SETTINGS.tokenGenCost),
  };
}

async function ensure() {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
}

export async function getSettings(): Promise<StudioSettings> {
  await ensure();
  try {
    return asSettings(JSON.parse(await fs.readFile(FILE, "utf8")));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(
  actor: PublicUser,
  next: Partial<StudioSettings>,
): Promise<StudioSettings> {
  if (!isStudio(actor)) throw new Error("forbidden");
  const cur = await getSettings();
  const row = asSettings({ ...cur, ...next });
  await ensure();
  await fs.writeFile(FILE, `${JSON.stringify(row, null, 2)}\n`, "utf8");
  return row;
}
