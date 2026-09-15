import { NextRequest, NextResponse } from "next/server";
import { isStudio, portableStudioToken } from "@/lib/auth";
import { isHomeTicket } from "@/lib/home-ticket";
import { issueLanHandoff, lanConsumeUrl, parseLanTarget } from "@/lib/lan-handoff";
import { getRequestSession } from "@/lib/session";
import { safeLoginNext } from "@/lib/login-next";
import { publicUrl } from "@/lib/public-url";

export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function carryForm(target: { origin: string; path: string }, ticket: string): NextResponse {
  const action = new URL("/api/auth/lan-consume", `${target.origin}/`).toString();
  const html = `<!doctype html>
<html lang="en-GB">
<head><meta charset="utf-8"><title>Continuing</title></head>
<body>
<form id="carry" method="post" action="${escapeHtml(action)}">
<input type="hidden" name="ticket" value="${escapeHtml(ticket)}">
<input type="hidden" name="next" value="${escapeHtml(target.path)}">
</form>
<p>Continuing…</p>
<script>document.getElementById("carry").submit();</script>
</body>
</html>`;
  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

/**
 * Copy a live hub session onto another host (LAN twin or public hub).
 * Home tickets POST across hosts so campus and live do not need a shared handoff file.
 */
export async function GET(req: NextRequest) {
  const rawNext = req.nextUrl.searchParams.get("next") || "";
  const target = parseLanTarget(rawNext);
  const fallback = publicUrl(req, "/account");
  if (!target) {
    return NextResponse.redirect(fallback, 302);
  }
  const hit = await getRequestSession(req);
  if (!hit) {
    const login = new URL(publicUrl(req, "/login"));
    login.searchParams.set("next", safeLoginNext(rawNext));
    return NextResponse.redirect(login, 302);
  }
  if (!isStudio(hit.user)) {
    return NextResponse.redirect(fallback, 302);
  }
  const here = new URL(publicUrl(req, "/"));
  if (here.origin === target.origin) {
    return NextResponse.redirect(new URL(target.path, `${target.origin}/`), 302);
  }
  const token = await portableStudioToken(hit.user, hit.token);
  if (isHomeTicket(token)) {
    return carryForm(target, token);
  }
  const code = await issueLanHandoff(hit.token);
  return NextResponse.redirect(lanConsumeUrl(target, code), 302);
}
