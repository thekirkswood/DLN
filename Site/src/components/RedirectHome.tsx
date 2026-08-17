"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function RedirectHome({ seconds = 3 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const t = window.setTimeout(() => router.replace("/"), seconds * 1000);
    return () => window.clearTimeout(t);
  }, [router, seconds]);
  return null;
}
