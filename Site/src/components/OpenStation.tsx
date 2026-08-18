"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function OpenStation() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch("/api/lab/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug: slug || undefined, party: "client" }),
    });
    const data = (await res.json().catch(() => null)) as {
      slug?: string;
      error?: string;
    } | null;
    setPending(false);
    if (!res.ok || !data?.slug) {
      setError(
        res.status === 409
          ? "That folder or plot already exists on this PC."
          : "Could not open a station.",
      );
      return;
    }
    router.push(`/lab/${data.slug}`);
    router.refresh();
  }

  return (
    <form className="lab-open" onSubmit={onSubmit}>
      <p className="kicker">Onboard</p>
      <h2>Open a station</h2>
      <p className="body">
        Makes a folder at home for someone we are building for. The site gets
        built in there. Live hosting is later.
      </p>
      <label htmlFor="st-name">Name</label>
      <input
        id="st-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label htmlFor="st-slug">Folder slug</label>
      <input
        id="st-slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="from the name if you leave this"
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Open station"}
      </button>
      {error ? <p className="err">{error}</p> : null}
    </form>
  );
}
