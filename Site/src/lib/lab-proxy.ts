import { NextRequest, NextResponse } from "next/server";
import { labBasePath, resolveHouse, startHint } from "@/lib/lab";
import { ensureHouse, holdHouse } from "@/lib/lab-runner";

const HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
]);

function downHtml(title: string, hint: string) {
  return `<!doctype html>
<html lang="en-GB">
<meta charset="utf-8"/>
<title>${title}</title>
<body style="font-family:ui-sans-serif,system-ui,sans-serif;padding:2.4rem;max-width:36rem;line-height:1.5">
<p style="letter-spacing:.16em;text-transform:uppercase;font-size:.72rem;color:#6e6e6e">Design Lab North</p>
<h1 style="font-weight:900;letter-spacing:-.03em">${title}</h1>
<p>This build is not running on this PC yet. Start it, then refresh.</p>
<pre style="white-space:pre-wrap;background:#f4f4f4;padding:1rem">${hint}</pre>
</body>
</html>`;
}

function rewriteLocation(value: string, slug: string, port: number): string {
  const base = labBasePath(slug);
  try {
    const u = new URL(value, `http://127.0.0.1:${port}`);
    if (u.hostname === "127.0.0.1" || u.hostname === "localhost") {
      let path = u.pathname || "/";
      if (!path.startsWith(base)) {
        path = `${base}${path.startsWith("/") ? path : `/${path}`}`;
      }
      return `${path}${u.search}${u.hash}`;
    }
  } catch {
    /* fall through */
  }
  if (value.startsWith("/") && !value.startsWith(base) && !value.startsWith("//")) {
    return `${base}${value}`;
  }
  return value;
}

function rewriteRootPaths(body: string, base: string): string {
  // Framed units serve under /go/{slug}. Absolute /assets and uploads must follow.
  if (!base || body.includes(`${base}/assets/`)) {
    // still rewrite any bare roots that slipped through
  }
  return body
    .replaceAll('"/assets/', `"${base}/assets/`)
    .replaceAll("'/assets/", `'${base}/assets/`)
    .replaceAll("(/assets/", `(${base}/assets/`)
    .replaceAll('"/admin-uploads/', `"${base}/admin-uploads/`)
    .replaceAll("'/admin-uploads/", `'${base}/admin-uploads/`)
    .replaceAll('"/profile-uploads/', `"${base}/profile-uploads/`)
    .replaceAll("'/profile-uploads/", `'${base}/profile-uploads/`)
    .replaceAll('url(/assets/', `url(${base}/assets/`)
    .replaceAll("url('/assets/", `url('${base}/assets/`)
    .replaceAll('url("/assets/', `url("${base}/assets/`);
}

export async function proxyLab(
  req: NextRequest,
  slug: string,
  parts: string[] | undefined,
): Promise<NextResponse> {
  const house = await resolveHouse(slug);
  if (!house?.localPort) {
    const hint = house
      ? startHint(house)
      : "Unknown build. Open the lab door and pick one that exists.";
    return new NextResponse(downHtml("Not on this PC", hint), {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const inner = (parts || []).filter(Boolean).join("/");
  const base = labBasePath(slug);
  const destPath = inner
    ? `${base}/${inner}`
    : slug === "swarm"
      ? `${base}/`
      : base;
  const url = `http://127.0.0.1:${house.localPort}${destPath}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (HOP.has(key.toLowerCase())) return;
    headers.set(key, value);
  });
  headers.set("host", `127.0.0.1:${house.localPort}`);
  headers.set("x-forwarded-host", req.headers.get("host") || "localhost:3010");
  headers.set("x-forwarded-proto", "http");

  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "HEAD";
  let body: ArrayBuffer | undefined;
  if (hasBody) body = await req.arrayBuffer();

  async function pull(): Promise<Response | null> {
    try {
      return await fetch(url, {
        method,
        headers,
        body: hasBody ? body : undefined,
        redirect: "manual",
      });
    } catch {
      return null;
    }
  }

  let upstream = await pull();
  if (!upstream) {
    holdHouse(slug, `proxy:${slug}`);
    const run = await ensureHouse(slug);
    if (run.status !== "ready") {
      return new NextResponse(downHtml(house.name, startHint(house)), {
        status: 503,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
    upstream = await pull();
  }
  if (!upstream) {
    return new NextResponse(downHtml(house.name, startHint(house)), {
      status: 503,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  holdHouse(slug, `proxy:${slug}`);

  const out = new Headers();
  upstream.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (HOP.has(k) || k === "x-frame-options" || k === "content-encoding") return;
    if (k === "content-security-policy") {
      out.set(
        key,
        value.replace(/frame-ancestors[^;]*;?/gi, "frame-ancestors 'self';"),
      );
      return;
    }
    if (k === "location") {
      out.set(key, rewriteLocation(value, slug, house.localPort as number));
      return;
    }
    out.set(key, value);
  });
  out.delete("x-frame-options");

  const ctype = (upstream.headers.get("content-type") || "").toLowerCase();
  const shouldRewrite =
    ctype.includes("text/html") ||
    ctype.includes("text/css") ||
    ctype.includes("javascript") ||
    ctype.includes("json");

  if (shouldRewrite) {
    const raw = await upstream.text();
    const rewritten = rewriteRootPaths(raw, base);
    out.delete("content-length");
    return new NextResponse(rewritten, {
      status: upstream.status,
      headers: out,
    });
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: out,
  });
}
