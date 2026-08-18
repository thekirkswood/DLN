"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/Mark";

export function Header({
  signedIn,
  studio = false,
  lab = false,
}: {
  signedIn: boolean;
  studio?: boolean;
  lab?: boolean;
}) {
  const path = usePathname();
  const [inSession, setInSession] = useState(signedIn);
  const atHome = path === "/";
  const atAccount = path === "/account" || path.startsWith("/account/");
  const atLogin = path === "/login";
  const atLab = path === "/lab" || path.startsWith("/lab/");
  const atAdmin = path === "/admin" || path.startsWith("/admin/");
  const showLab = lab && studio && inSession;

  useEffect(() => {
    setInSession(signedIn);
  }, [signedIn]);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((data: { user?: unknown }) => {
        if (alive) setInSession(Boolean(data?.user));
      })
      .catch(() => {
        if (alive) setInSession(false);
      });
    return () => {
      alive = false;
    };
  }, [path]);

  return (
    <header className="site-header wrap">
      <Link className="brand-link" href="/" aria-label="Design Lab North home">
        <Mark size="nav" />
      </Link>
      <nav>
        {atHome ? null : <Link href="/">Home</Link>}
        {showLab && !atLab ? <Link href="/lab">Lab</Link> : null}
        {showLab && !atAdmin && !atLab ? <Link href="/admin">Builder</Link> : null}
        {inSession ? (
          atAccount ? null : <Link href="/account">Account</Link>
        ) : atLogin ? null : (
          <Link href={lab ? "/login?next=/lab" : "/login?next=/account"}>Sign in</Link>
        )}
      </nav>
    </header>
  );
}
