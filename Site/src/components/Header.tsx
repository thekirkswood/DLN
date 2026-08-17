"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/Mark";

export function Header({ signedIn }: { signedIn: boolean }) {
  const path = usePathname();
  const [inSession, setInSession] = useState(signedIn);
  const atHome = path === "/";
  const atAccount = path === "/account" || path.startsWith("/account/");
  const atLogin = path === "/login";

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
        {inSession ? (
          atAccount ? null : <Link href="/account">Account</Link>
        ) : atLogin ? null : (
          <Link href="/login?next=/account">Sign in</Link>
        )}
      </nav>
    </header>
  );
}
