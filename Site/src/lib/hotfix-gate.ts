/** Client hotfix: ping the host, then decide if this is a fault or an edit. */

export type HotfixPing = {
  url: string;
  ok: boolean;
  status: number | null;
};

const FAULT =
  /\b(broken|down|offline|404|500|error|crash|blank|won't load|wont load|not loading|can't load|cannot load|typo|spelling|misspell|misspelt|can't sign|cannot sign|sign[- ]?in|login (fail|broken)|form (doesn't|doesnt|won't|wont)|wrong (price|email|number)|ssl|certificate|timeout|won't send|wont send|not working|isn't working|isnt working|spelt|spelled)\b/i;

export function looksLikeFault(text: string): boolean {
  return FAULT.test(text.trim());
}

export async function pingUrl(url: string): Promise<HotfixPing> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    return { url, ok: res.ok, status: res.status };
  } catch {
    return { url, ok: false, status: null };
  }
}

export async function assessHotfix(input: {
  body: string;
  urls: string[];
}): Promise<{
  action: boolean;
  fault: boolean;
  hostUp: boolean | null;
  pings: HotfixPing[];
}> {
  const seen = new Set<string>();
  const pings: HotfixPing[] = [];
  for (const url of input.urls) {
    const u = (url || "").trim();
    if (!u || seen.has(u)) continue;
    seen.add(u);
    pings.push(await pingUrl(u));
  }
  const hostUp = pings.length ? pings.some((p) => p.ok) : null;
  const fault = looksLikeFault(input.body);
  const action = hostUp === false || fault;
  return { action, fault, hostUp, pings };
}
