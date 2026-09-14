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
  studio,
  lab,
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
  const atBoard = path === "/board" || path.startsWith("/board/");
  const atPractice = path === "/practice";
  const atWork = path === "/work";
  const atGreenhouse = path === "/greenhouse" || path.startsWith("/greenhouse/");
  const atLogin = path === "/login";
  const atBlocked = path === "/blocked" || path.startsWith("/blocked/");
  const atEpk = path === "/epk" || path.startsWith("/epk/");
  const atSuggest = path.startsWith("/suggest");

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
        if (user) {
          setInSession(true);
          setMe(user);
          return;
        }
        if (!signedIn) {
          setInSession(false);
          setMe(null);
        }
      })
      .catch(() => {
        /* Keep the last known session if the hub is briefly down. */
      });
    return () => {
      alive = false;
    };
  }, [path, signedIn]);

  if (atSuggest || atHome || atBlocked || atEpk) return null;

  const faceId = me?.id || userId;
  const faceOn = me ? Boolean(me.avatar) : Boolean(hasAvatar);
  const name = me?.displayName || displayName || "Account";

  return (
    <header className={atWork ? "site-header wrap is-work" : "site-header wrap"}>
      <Link className="brand-link" href="/" aria-label="Design Lab North home">
        <Mark size="nav" />
      </Link>
      <nav>
        {atHome ? null : <Link href="/">Home</Link>}
        {atPractice ? null : <Link href="/practice">Practice</Link>}
        {atWork ? null : <Link href="/work">Work</Link>}
        {atGreenhouse ? null : <Link href="/greenhouse">Greenhouse</Link>}
      </nav>
      {inSession && faceId ? (
        <AccountMenu
          userId={faceId}
          hasAvatar={faceOn}
          name={name}
          atAccount={atAccount}
          atBoard={atBoard}
          studio={studio}
          lab={lab}
        />
      ) : atLogin ? null : (
        <Link className="nav-signin" href="/login?next=/account">
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
  atAccount,
  atBoard,
  studio,
  lab,
}: {
  userId: string;
  hasAvatar: boolean;
  name: string;
  atAccount: boolean;
  atBoard?: boolean;
  studio?: boolean;
  lab?: boolean;
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
          {studio && !lab ? (
            <Link role="menuitem" href="/desk" onClick={() => setOpen(false)}>
              Home book
            </Link>
          ) : null}
          {studio && lab && !atBoard ? (
            <Link role="menuitem" href="/board" onClick={() => setOpen(false)}>
              Board
            </Link>
          ) : null}
          {atAccount ? null : (
            <Link role="menuitem" href="/account" onClick={() => setOpen(false)}>
              Account
            </Link>
          )}
          <a role="menuitem" href="/logout">
            Sign out
          </a>
        </div>
      ) : null}
    </div>
  );
}
