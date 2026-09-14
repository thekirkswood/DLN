import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE, isStudio, touchSession } from "@/lib/auth";
import { appendSessionCookies } from "@/lib/cookie-opts";
import { allPlots, enterUrlFor, hostUrlFor } from "@/lib/plots";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(COOKIE)?.value;
  const user = await touchSession(token);
  if (!user) {
    return NextResponse.json({ user: null, plots: [] });
  }
  const all = await allPlots();
  const allowed = isStudio(user)
    ? all
    : all.filter(
        (p) => user.plots.includes("*") || user.plots.includes(p.slug),
      );
  const plots = allowed.map((p) => ({
    slug: p.slug,
    name: p.name,
    status: p.status,
    party: p.party,
    hostUrl: hostUrlFor(p),
    enterUrl: enterUrlFor(p),
    sandbox: p.localPreview,
  }));
  const res = NextResponse.json({ user, plots });
  if (token) {
    const h = headers();
    appendSessionCookies(
      res.headers,
      token,
      h.get("x-forwarded-host") || h.get("host"),
      h.get("x-forwarded-proto"),
    );
  }
  return res;
}
