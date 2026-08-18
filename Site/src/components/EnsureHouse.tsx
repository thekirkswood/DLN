"use client";

import { useEffect, useState } from "react";

export type HousePhase = "idle" | "starting" | "ready" | "error";

function leaseIdFor(slug: string): string {
  const key = `dln-unit-lease-${slug}`;
  try {
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(key, id);
    return id;
  } catch {
    return crypto.randomUUID();
  }
}

async function ping(
  slug: string,
  lease: string,
  hold: boolean,
  start: boolean,
): Promise<{ ok: boolean; status?: string }> {
  const res = await fetch("/api/lab/houses", {
    method: "POST",
    credentials: "include",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ slug, lease, hold, start }),
    keepalive: !hold,
  });
  const data = (await res.json().catch(() => null)) as {
    ok?: boolean;
    house?: { status?: string };
  } | null;
  return { ok: Boolean(res.ok && data?.ok), status: data?.house?.status };
}

function releaseBeacon(slug: string, lease: string) {
  const fd = new FormData();
  fd.set("slug", slug);
  fd.set("lease", lease);
  fd.set("hold", "false");
  fd.set("start", "false");
  try {
    if (!navigator.sendBeacon("/api/lab/houses", fd)) {
      void ping(slug, lease, false, false);
    }
  } catch {
    void ping(slug, lease, false, false);
  }
}

/** Holds a unit while this page is open. Starts its app. Lets it sleep at zero. */
export function useEnsureHouse(slug: string | null): HousePhase {
  const [phase, setPhase] = useState<HousePhase>(slug ? "starting" : "idle");

  useEffect(() => {
    if (!slug) {
      setPhase("idle");
      return;
    }
    if (slug === "dln") {
      setPhase("ready");
      return;
    }
    const lease = leaseIdFor(slug);
    let alive = true;
    setPhase("starting");

    ping(slug, lease, true, true)
      .then((data) => {
        if (!alive) return;
        setPhase(data.ok && data.status === "ready" ? "ready" : "error");
      })
      .catch(() => {
        if (alive) setPhase("error");
      });

    const beat = () => {
      void ping(slug, lease, true, false);
    };
    const interval = window.setInterval(beat, 10_000);

    const onHide = () => {
      if (document.visibilityState === "hidden") beat();
    };
    document.addEventListener("visibilitychange", onHide);

    const onLeave = () => releaseBeacon(slug, lease);
    window.addEventListener("pagehide", onLeave);

    return () => {
      alive = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", onLeave);
      releaseBeacon(slug, lease);
    };
  }, [slug]);

  return phase;
}

export function EnsureHouse({ slug }: { slug: string }) {
  useEnsureHouse(slug);
  return null;
}
