import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { isStudio, portableStudioToken, touchSession } from "@/lib/auth";
import { appendSessionCookies } from "@/lib/cookie-opts";
import { pressKitForPlot } from "@/lib/epk-map";
import { isLabHost } from "@/lib/lab-host";
import {
  allPlots,
  buildUrlFor,
  enterUrlFor,
  hostUrlFor,
  previewUrlFor,
} from "@/lib/plots";
import { sessionFromRequest } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const hit = await sessionFromRequest();
  if (!hit) {
    return NextResponse.json({ user: null, plots: [] });
  }
  const user = await touchSession(hit.token);
  if (!user) {
    return NextResponse.json({ user: null, plots: [] });
  }
  const token = await portableStudioToken(user, hit.token);
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const lab = isLabHost(host);
  const all = await allPlots();
  const allowed = isStudio(user)
    ? all
    : all.filter(
        (p) => user.plots.includes("*") || user.plots.includes(p.slug),
      );
  const plots = allowed.map((p) => {
    const hostUrl = hostUrlFor(p);
    const buildUrl = buildUrlFor(p, host);
    return {
      slug: p.slug,
      name: p.name,
      status: p.status,
      party: p.party,
      hostUrl,
      buildUrl,
      previewUrl: previewUrlFor(p, lab, host),
      enterUrl: enterUrlFor(p),
      plane: lab ? "build" : "live",
      port: p.lab?.localPort ?? null,
      sandbox: p.localPreview,
      kit: pressKitForPlot(p.slug),
    };
  });
  const res = NextResponse.json({ user, plots });
  appendSessionCookies(
    res.headers,
    token,
    host,
    h.get("x-forwarded-proto"),
  );
  return res;
}
