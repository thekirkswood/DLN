"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginForm() {
  const search = useSearchParams();
  const next = search.get("next") || "/account";
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
    if (!res.ok) {
      setError("That sign-in didn’t match.");
      return;
    }
    window.location.href = safeNext(next);
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
        Your login opens the sites on your account, the billing book, and
        Various Titles when you are a paying customer. A{" "}
        <code>@designlabnorth.local</code> address is an internal handle, not a
        mailbox.
      </p>
    </form>
  );
}
