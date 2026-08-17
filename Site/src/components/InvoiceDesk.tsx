"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATALOGUE,
  STAGES,
  type CatalogueItem,
  formatGbp,
  priceLabel,
} from "@/data/catalogue";
import type { Line } from "@/lib/billing";
import { localHandleFromName } from "@/lib/handles";

type Person = {
  id: string;
  displayName: string;
  email: string;
  plots: string[];
};

type PlotOpt = { slug: string; name: string };

function newLine(item: CatalogueItem, plotSlug?: string, amount?: number): Line {
  return {
    id: crypto.randomUUID(),
    description: item.name,
    amountGbp: amount ?? item.amountGbp,
    waived: false,
    presetId: item.id,
    cadence: item.cadence,
    plotSlug: item.plotBound ? plotSlug : undefined,
    titlesGrant: item.titlesGrant,
  };
}

export function InvoiceComposer({
  people,
  plots,
  fixedUserId,
}: {
  people: Person[];
  plots: PlotOpt[];
  fixedUserId?: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(fixedUserId || people[0]?.id || "");
  const [plotSlug, setPlotSlug] = useState(plots[0]?.slug || "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [manual, setManual] = useState({ description: "", amountGbp: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  useEffect(() => {
    if (fixedUserId) setUserId(fixedUserId);
  }, [fixedUserId]);

  const person = people.find((p) => p.id === userId);
  const personPlots = useMemo(() => {
    if (!person) return plots;
    if (person.plots.includes("*")) return plots;
    const bound = plots.filter((p) => person.plots.includes(p.slug));
    return bound.length ? bound : plots;
  }, [person, plots]);

  const total = lines.reduce((sum, l) => sum + (l.waived ? 0 : l.amountGbp), 0);

  function addPreset(item: CatalogueItem) {
    const plot = item.plotBound ? plotSlug || personPlots[0]?.slug : undefined;
    const line = newLine(item, plot);
    setLines((rows) => [...rows, line]);
  }

  function addManual(e: FormEvent) {
    e.preventDefault();
    const amountGbp = Number(manual.amountGbp);
    if (!manual.description.trim() || !Number.isFinite(amountGbp) || amountGbp < 0) return;
    setLines((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        description: manual.description.trim(),
        amountGbp,
        waived: false,
        cadence: "once",
      },
    ]);
    setManual({ description: "", amountGbp: "" });
  }

  async function save(issue: boolean) {
    setError("");
    setSaved("");
    if (!userId || !lines.length) {
      setError("Pick a person and add a line.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/billing/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, notes, lines }),
    });
    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    if (!res.ok || !data?.id) {
      setPending(false);
      setError("Draft didn’t save.");
      return;
    }
    if (issue) {
      const issued = await fetch("/api/billing/issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: data.id }),
      });
      setPending(false);
      if (!issued.ok) {
        setError("Saved as draft. Issue didn’t take.");
        router.refresh();
        return;
      }
      setLines([]);
      setNotes("");
      setSaved("Issued.");
      router.refresh();
      return;
    }
    setPending(false);
    setSaved("Draft saved.");
    router.refresh();
  }

  return (
    <div className="desk">
      <div className="desk-who">
        {fixedUserId ? null : (
          <>
            <label htmlFor="bill-person">Person</label>
            <select id="bill-person" value={userId} onChange={(e) => setUserId(e.target.value)}>
              {people.length === 0 ? <option value="">No clients yet</option> : null}
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} · {p.email}
                </option>
              ))}
            </select>
          </>
        )}
        <label htmlFor="bill-plot">Site (for hosting lines)</label>
        <select id="bill-plot" value={plotSlug} onChange={(e) => setPlotSlug(e.target.value)}>
          {personPlots.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {STAGES.map((stage) => (
        <div key={stage.id} className="preset-block">
          <h3>{stage.name}</h3>
          <div className="preset-row">
            {CATALOGUE.filter((c) => c.stage === stage.id).map((item) => (
              <button
                key={item.id}
                type="button"
                className="preset"
                onClick={() => addPreset(item)}
              >
                {item.name}
                <span>{priceLabel(item.amountGbp)}</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      <form className="manual-line" onSubmit={addManual}>
        <label htmlFor="manual-desc">Manual line</label>
        <input
          id="manual-desc"
          value={manual.description}
          onChange={(e) => setManual({ ...manual, description: e.target.value })}
          placeholder="What we did"
        />
        <label htmlFor="manual-gbp">Amount (£)</label>
        <input
          id="manual-gbp"
          inputMode="decimal"
          value={manual.amountGbp}
          onChange={(e) => setManual({ ...manual, amountGbp: e.target.value })}
          placeholder="0"
        />
        <button type="submit">Add</button>
      </form>

      <div className="compose-lines">
        {lines.length === 0 ? (
          <p className="body">Tap a preset or write a line.</p>
        ) : (
          lines.map((line) => (
            <div key={line.id} className={`compose-line${line.waived ? " is-waived" : ""}`}>
              <div>
                <strong className={line.waived ? "strike" : undefined}>{line.description}</strong>
                {line.plotSlug ? <span className="status">{line.plotSlug}</span> : null}
              </div>
              <div className="cost">
                {line.waived ? (
                  <>
                    <span className="strike">{formatGbp(line.amountGbp)}</span>
                    <span> waived</span>
                  </>
                ) : (
                  formatGbp(line.amountGbp)
                )}
              </div>
              <div className="line-acts">
                <button
                  type="button"
                  onClick={() =>
                    setLines((rows) =>
                      rows.map((r) => (r.id === line.id ? { ...r, waived: !r.waived } : r)),
                    )
                  }
                >
                  {line.waived ? "Unwaive" : "Waive"}
                </button>
                <button
                  type="button"
                  onClick={() => setLines((rows) => rows.filter((r) => r.id !== line.id))}
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <p className="compose-total">Total {formatGbp(total)}</p>
      <label htmlFor="bill-notes">Note</label>
      <textarea
        id="bill-notes"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <div className="actions">
        <button type="button" disabled={pending} onClick={() => save(false)}>
          Save draft
        </button>
        <button type="button" disabled={pending} onClick={() => save(true)}>
          Issue
        </button>
      </div>
      {error ? <p className="err">{error}</p> : null}
      {saved ? <p className="note">{saved}</p> : null}
    </div>
  );
}

export function OnboardForm({ plots }: { plots: PlotOpt[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk("");
    const form = new FormData(e.currentTarget);
    const plotsPicked = form.getAll("plots").map(String);
    setPending(true);
    const res = await fetch("/api/studio/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        displayName: form.get("displayName"),
        password: form.get("password"),
        plots: plotsPicked,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError(res.status === 409 ? "That email is already on the book." : "Onboard didn’t take.");
      return;
    }
    e.currentTarget.reset();
    setName("");
    setEmail("");
    setOk("On the book.");
    router.refresh();
  }

  return (
    <form className="onboard" onSubmit={onSubmit}>
      <p className="body bill-note">
        A real email, or an internal handle ending{" "}
        <code>@designlabnorth.local</code>. That is not a mailbox — it is the
        login on this book, and the same login for Various Titles.
      </p>
      <label htmlFor="ob-name">Name</label>
      <input
        id="ob-name"
        name="displayName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label htmlFor="ob-email">Login</label>
      <input
        id="ob-email"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="name@designlabnorth.local"
        required
      />
      <button
        type="button"
        className="act-quiet"
        onClick={() => setEmail(localHandleFromName(name))}
      >
        Use a .local handle
      </button>
      <label htmlFor="ob-pass">Password</label>
      <input id="ob-pass" name="password" type="password" minLength={8} required />
      <fieldset>
        <legend>Sites</legend>
        {plots.map((p) => (
          <label key={p.slug} className="check">
            <input type="checkbox" name="plots" value={p.slug} />
            {p.name}
          </label>
        ))}
      </fieldset>
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Onboard"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}

export function ConvertTitles({
  people,
  fixedUserId,
}: {
  people: Person[];
  fixedUserId?: string;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(fixedUserId || people[0]?.id || "");
  const [grant, setGrant] = useState<"section" | "full">("section");
  const [waived, setWaived] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    if (fixedUserId) setUserId(fixedUserId);
  }, [fixedUserId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!userId) {
      setError("Pick a person.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/billing/titles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, grant, waived }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Conversion didn’t take.");
      return;
    }
    setOk("On the Various Titles line. They pay on this book.");
    router.refresh();
  }

  return (
    <form className="onboard" onSubmit={onSubmit}>
      <p className="body bill-note">
        Same Design Lab North login opens Various Titles. Billing stays here.
        They have to be a paying customer — unless you waive the line.
      </p>
      {fixedUserId ? null : (
        <>
          <label htmlFor="vt-person">Person</label>
          <select id="vt-person" value={userId} onChange={(e) => setUserId(e.target.value)}>
            {people.length === 0 ? <option value="">No clients yet</option> : null}
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} · {p.email}
              </option>
            ))}
          </select>
        </>
      )}
      <label htmlFor="vt-grant">Resource</label>
      <select
        id="vt-grant"
        value={grant}
        onChange={(e) => setGrant(e.target.value as "section" | "full")}
      >
        <option value="section">Section</option>
        <option value="full">Full resource</option>
      </select>
      <label className="check">
        <input
          type="checkbox"
          checked={waived}
          onChange={(e) => setWaived(e.target.checked)}
        />
        Waive (struck through, still on)
      </label>
      <button type="submit" disabled={pending || !userId}>
        {pending ? "…" : "Convert"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}
