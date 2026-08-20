"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const PING_MS = 3 * 60 * 1000;

/** Studio session is on: ping every few minutes so campus sniff stays armed until logout. */
export function StudioPresence() {
  const path = usePathname() || "/";

  useEffect(() => {
    let alive = true;
    const ping = () => {
      if (!alive) return;
      void fetch("/api/lab/presence", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hold: true, page: path }),
      });
    };
    ping();
    const id = window.setInterval(ping, PING_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") ping();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [path]);

  return null;
}
