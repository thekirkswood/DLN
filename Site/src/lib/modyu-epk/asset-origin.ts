import { LAN_IP } from "@/lib/lan-names";

/** Origin for ModYu plot public assets (images stay on the plot). */
export function modyuAssetOrigin(): string {
  const fromEnv = (
    process.env.NEXT_PUBLIC_MODYU_ASSET_ORIGIN ||
    process.env.MODYU_ASSET_ORIGIN ||
    ""
  ).trim().replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") {
    return `http://${LAN_IP}:3000`;
  }
  return "https://modyu.designlabnorth.com";
}

/** Prefix root-absolute ModYu asset paths with the plot origin. */
export function modyuAsset(path: string | undefined | null): string {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:") ||
    path.startsWith("//")
  ) {
    return path;
  }
  const origin = modyuAssetOrigin();
  // Hub vault and kit stills live on this campus, not the ModYu plot.
  if (path.startsWith("/press/") || path.startsWith("/kit-stills/")) return path;
  if (path.startsWith("/")) return `${origin}${path}`;
  return `${origin}/${path}`;
}
