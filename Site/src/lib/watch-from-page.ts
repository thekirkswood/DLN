import { cookies, headers } from "next/headers";
import { clientIpFrom } from "@/lib/client-ip";
import { sessionFromRequest } from "@/lib/session";
import { WATCH_COOKIE, tapWatch } from "@/lib/watch";

/** Node path: Edge waitUntil fetch can miss live (SSRF / Caddy / Cloudflare). */
export async function tapWatchFromPage() {
  const h = headers();
  const path = h.get("x-dln-watch-path") || "";
  if (!path) return;
  try {
    const hit = await sessionFromRequest();
    await tapWatch({
      ip: h.get("x-dln-watch-ip") || clientIpFrom(h),
      host: h.get("x-forwarded-host") || h.get("host") || "",
      path,
      ua: h.get("user-agent") || "",
      cookie: cookies().get(WATCH_COOKIE)?.value === "1",
      token: hit?.token,
    });
  } catch {
    return;
  }
}
