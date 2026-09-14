"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { continueAfterLogin } from "@/lib/login-next";

export default function LoginForm() {
  const search = useSearchParams();
  const nextParam = search.get("next");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      cache: "no-store",
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
          "The house is not answering. Studio sign-in on the public site talks home — try this site on the LAN, or wait a moment.",
        );
      } else {
        setError("That sign-in didn’t match.");
      }
      return;
    }
    const here = typeof window !== "undefined" ? window.location.origin : "";
    window.location.href = continueAfterLogin(nextParam || "/account", here);
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
        Sign in to your sites and your invoices.
      </p>
    </form>
  );
}
