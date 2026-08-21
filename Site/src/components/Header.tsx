"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mark } from "@/components/Mark";

type Me = {
  id: string;
  displayName?: string;
  avatar?: string;
  role?: string;
};

export function Header({
  signedIn,
  studio = false,
  lab = false,
  userId,
  hasAvatar,
  displayName,
}: {
  signedIn: boolean;
  studio?: boolean;
  lab?: boolean;
  userId?: string;
  hasAvatar?: boolean;
  displayName?: string;
}) {
  const path = usePathname() || "/";
  const [inSession, setInSession] = useState(signedIn);
  const [me, setMe] = useState<Me | null>(
    userId ? { id: userId, displayName } : null,
  );
  const atHome = path === "/";
  const atAccount = path === "/account" || path.startsWith("/account/");
  const atPractice = path === "/practice";
  const atWork = path === "/work";
  const atGreenhouse = path === "/greenhouse" || path.startsWith("/greenhouse/");
  const atLogin = path === "/login";
  const atLab = path === "/lab" || path.startsWith("/lab/");
  const atAdmin = path === "/admin" || path.startsWith("/admin/");
  const onLab = studio && inSession;
  const atSuggest = path.startsWith("/suggest");
  const atCampus = onLab && (atLab || atAdmin);

  useEffect(() => {
    setInSession(signedIn);
    setMe(userId ? { id: userId, avatar: hasAvatar ? "1" : undefined, displayName } : null);
  }, [signedIn, userId, hasAvatar, displayName]);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!alive) return;
        if (!res.ok) return;
        const data = (await res.json()) as { user?: Me | null };
        const user = data?.user || null;
        setInSession(Boolean(user));
        setMe(user);
      })
      .catch(() => {
        /* Keep the last known session if campus is briefly down (rebuild). */
      });
    return () => {
      alive = false;
    };
  }, [path]);

  if (atSuggest) return null;

  const faceId = me?.id || userId;
  const faceOn = me ? Boolean(me.avatar) : Boolean(hasAvatar);
  const name = me?.displayName || displayName || "Account";

  return (
    <header
      className={
        atCampus
          ? "site-header wrap is-campus"
          : atWork
            ? "site-header wrap is-work"
            : "site-header wrap"
      }
    >
      <Link
        className="brand-link"
        href={atCampus ? "/lab" : "/"}
        aria-label={atCampus ? "Campus" : "Design Lab North home"}
      >
        <Mark size="nav" />
      </Link>
      {atCampus ? null : (
        <nav>
          {atHome ? null : <Link href="/">Home</Link>}
          {atPractice ? null : <Link href="/practice">Practice</Link>}
          {atWork ? null : <Link href="/work">Work</Link>}
          {atGreenhouse ? null : <Link href="/greenhouse">Greenhouse</Link>}
        </nav>
      )}
      {inSession && faceId ? (
        <AccountMenu
          userId={faceId}
          hasAvatar={faceOn}
          name={name}
          campus={onLab}
          atCampus={atCampus}
          atAccount={atAccount}
        />
      ) : atLogin ? null : (
        <Link
          className="nav-signin"
          href={lab || studio ? "/login?next=/lab" : "/login?next=/account"}
        >
          Sign in
        </Link>
      )}
    </header>
  );
}

function AccountMenu({
  userId,
  hasAvatar,
  name,
  campus,
  atCampus,
  atAccount,
}: {
  userId: string;
  hasAvatar: boolean;
  name: string;
  campus: boolean;
  atCampus: boolean;
  atAccount: boolean;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="nav-account" ref={box}>
      <button
        type="button"
        className={open ? "nav-face-btn is-open" : "nav-face-btn"}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name}
        onClick={() => setOpen((v) => !v)}
      >
        {hasAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="nav-face" src={`/api/account/avatar/${userId}`} alt="" />
        ) : (
          <span className="nav-face is-empty" aria-hidden />
        )}
      </button>
      {open ? (
        <div className="nav-menu" role="menu">
          {campus && !atCampus ? (
            <Link role="menuitem" href="/lab" onClick={() => setOpen(false)}>
              Campus
            </Link>
          ) : null}
          {atAccount ? null : (
            <Link role="menuitem" href="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          )}
          {atCampus ? (
            <Link role="menuitem" href="/" onClick={() => setOpen(false)}>
              Live site
            </Link>
          ) : null}
          <a role="menuitem" href="/logout">
            Sign out
          </a>
        </div>
      ) : null}
    </div>
  );
}
