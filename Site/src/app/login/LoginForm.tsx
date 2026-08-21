"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const search = useSearchParams();
  const nextParam = search.get("next");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  function safeNext(value: string) {
    if (value.startsWith("/") && !value.startsWith("//")) return value;
    try {
      const u = new URL(value);
      const host = u.hostname.toLowerCase();
      if (
        (host === "designlabnorth.com" || host.endsWith(".designlabnorth.com")) &&
        (u.protocol === "https:" || u.protocol === "http:")
      ) {
        return value;
      }
    } catch {
      /* fall through */
    }
    return "/account";
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    setPending(false);
    const data = (await res.json().catch(() => null)) as {
      reason?: string;
      user?: { role?: string };
    } | null;
    if (!res.ok) {
      if (data?.reason === "campus_only") {
        setError(
          "That account is an offline campus puppet — sign in on localhost / the lab PC, not the public hub.",
        );
      } else if (data?.reason === "hub_locked") {
        setError("That account doesn’t sign in on this host.");
      } else if (data?.reason === "home_unreachable") {
        setError(
          "The house is not answering. Studio sign-in on the public site talks home — try the campus on the LAN, or wait a moment.",
        );
      } else {
        setError("That sign-in didn’t match.");
      }
      return;
    }
    const role = data?.user?.role;
    const studio = role === "owner" || role === "studio";
    if (nextParam) {
      const dest = safeNext(nextParam);
      if (studio && (dest === "/account" || dest.startsWith("/account/"))) {
        window.location.href = "/lab";
        return;
      }
      window.location.href = dest;
      return;
    }
    window.location.href = studio ? "/lab" : "/account";
  }

  return (
    <form className="form wrap" onSubmit={onSubmit}>
      <p className="kicker">Account</p>
      <h1>Sign in</h1>
      {error ? <p className="err">{error}</p> : null}
      <label htmlFor="email">Email</label>
      <input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Password</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Enter"}
      </button>
      <p className="note">
        Your login opens the sites on your account and the billing book. Studio
        opens campus at home — on this LAN, or through the public host talking
        back to the house.
      </p>
    </form>
  );
}
