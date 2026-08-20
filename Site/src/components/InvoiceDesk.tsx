"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { STAGES, formatGbp, priceLabel, type CatalogueItem, type Stage } from "@/data/catalogue";
import { formatLondonDate, payByIso } from "@/lib/clock";
import { BookClock } from "@/components/BookClock";
import type { Line, PayRail, OnlineRail, ExtraCharge } from "@/lib/billing";
import { localHandleFromName } from "@/lib/handles";

type Person = {
  id: string;
  displayName: string;
  email: string;
  plots: string[];
};

type PlotOpt = { slug: string; name: string };

function LineAmount({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  return (
    <label className="gbp-edit">
      <span className="visually-hidden">Amount (£)</span>
      <span aria-hidden>£</span>
      <input
        inputMode="decimal"
        value={text}
        onChange={(e) => {
          const raw = e.target.value;
          if (!/^\d*\.?\d{0,2}$/.test(raw) && raw !== "") return;
          setText(raw);
          if (raw === "" || raw === ".") {
            onChange(0);
            return;
          }
          const n = Number(raw);
          if (Number.isFinite(n) && n >= 0) onChange(n);
        }}
      />
    </label>
  );
}

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
  catalogue,
  graceDays = 7,
}: {
  people: Person[];
  plots: PlotOpt[];
  fixedUserId?: string;
  catalogue: CatalogueItem[];
  graceDays?: number;
}) {
  const router = useRouter();
  const [userId, setUserId] = useState(fixedUserId || people[0]?.id || "");
  const [plotSlug, setPlotSlug] = useState(plots[0]?.slug || "");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<Line[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [stage, setStage] = useState<Stage>("strategy");
  const composeRef = useRef<HTMLDivElement>(null);
  const [composeSlide, setComposeSlide] = useState(1);
  const [other, setOther] = useState<Record<Stage, { description: string; amountGbp: string }>>({
    design: { description: "", amountGbp: "" },
    strategy: { description: "", amountGbp: "" },
    build: { description: "", amountGbp: "" },
  });

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
  const payBy = payByIso(undefined, new Date().toISOString(), graceDays);

  useEffect(() => {
    const el = composeRef.current;
    if (!el) return;
    function sync() {
      const track = composeRef.current;
      if (!track) return;
      const w = track.clientWidth;
      if (!w) return;
      const i = Math.round(track.scrollLeft / w);
      const next = Math.max(0, Math.min(STAGES.length - 1, i));
      setComposeSlide(next);
      setStage(STAGES[next].id);
    }
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  function goCompose(i: number) {
    const track = composeRef.current;
    setComposeSlide(i);
    setStage(STAGES[i].id);
    track?.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  function addPreset(item: CatalogueItem) {
    const plot = item.plotBound ? plotSlug || personPlots[0]?.slug : undefined;
    const line = newLine(item, plot);
    setLines((rows) => [...rows, line]);
  }

  function addOther(e: FormEvent, facet: Stage) {
    e.preventDefault();
    const row = other[facet];
    const amountGbp = Number(row.amountGbp);
    if (!row.description.trim() || !Number.isFinite(amountGbp) || amountGbp < 0) return;
    setLines((rows) => [
      ...rows,
      {
        id: crypto.randomUUID(),
        description: row.description.trim(),
        amountGbp,
        waived: false,
        cadence: "once",
      },
    ]);
    setOther((rows) => ({ ...rows, [facet]: { description: "", amountGbp: "" } }));
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
        body: JSON.stringify({ id: data.id, ping: true }),
      });
      const out = (await issued.json().catch(() => null)) as { pinged?: boolean } | null;
      setPending(false);
      if (!issued.ok) {
        setError("Saved as draft. Ping didn’t take.");
        router.refresh();
        return;
      }
      setLines([]);
      setNotes("");
      setSaved(
        out?.pinged
          ? "Pinged. They pay in the online system."
          : "Issued. Online pay isn’t connected yet — they still owe.",
      );
      router.refresh();
      return;
    }
    setPending(false);
    setSaved("Draft saved.");
    router.refresh();
  }

  return (
    <div className="desk book-compose price-book">
      <BookClock />
      <p className="body bill-note">
        Tap a line to put it on the invoice — amounts come from Settings.
        Other is a Reason and a Charge for this situation. Ping sends them to
        pay online. They have {graceDays} days
        {payBy ? ` (pay by ${formatLondonDate(payBy)})` : ""}. Weekly and
        monthly lines keep rolling.
      </p>
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
        {catalogue.some((item) => item.plotBound) ? (
          <>
            <label htmlFor="bill-plot">Site (for hosting lines)</label>
            <select id="bill-plot" value={plotSlug} onChange={(e) => setPlotSlug(e.target.value)}>
              {personPlots.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </>
        ) : null}
      </div>

      <div className="charge-dots" role="tablist" aria-label="Design, Strategy, Build">
        {STAGES.map((row, i) => (
          <button
            key={row.id}
            type="button"
            role="tab"
            aria-selected={composeSlide === i}
            className={composeSlide === i ? "charge-tab is-on" : "charge-tab"}
            onClick={() => goCompose(i)}
          >
            {row.name}
          </button>
        ))}
      </div>
      <div className="charge-track" ref={composeRef} aria-label="What we charge">
        {STAGES.map((row) => (
          <div key={row.id} className="charge-col">
            <h3>{row.name}</h3>
            {catalogue
              .filter((c) => c.stage === row.id)
              .map((item) => {
                const on = lines.some((l) => l.presetId === item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`charge-item is-pick${on ? " is-on" : ""}`}
                    aria-pressed={on}
                    onClick={() => addPreset(item)}
                  >
                    <span className="charge-name">{item.name}</span>
                    <span className="charge-blurb">{item.blurb}</span>
                    <span className="charge-box">
                      <span>Charge £</span>
                      <span className="charge-gbp">
                        {item.amountGbp > 0 ? String(item.amountGbp) : "0"}
                      </span>
                      <span className="charge-pick-state">{on ? "On" : "Add"}</span>
                    </span>
                  </button>
                );
              })}
            <form className="charge-item charge-other" onSubmit={(e) => addOther(e, row.id)}>
              <label htmlFor={`other-${row.id}`}>Other</label>
              <input
                id={`other-${row.id}`}
                value={other[row.id].description}
                onChange={(e) =>
                  setOther((rows) => ({
                    ...rows,
                    [row.id]: { ...rows[row.id], description: e.target.value },
                  }))
                }
                placeholder="Reason"
              />
              <div className="charge-box">
                <span>Charge £</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={other[row.id].amountGbp}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (!/^\d*\.?\d{0,2}$/.test(raw) && raw !== "") return;
                    setOther((rows) => ({
                      ...rows,
                      [row.id]: { ...rows[row.id], amountGbp: raw },
                    }));
                  }}
                  placeholder="0"
                />
                <button type="submit" className="act-quiet">
                  Add line
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>

      <div className="compose-lines">
        {lines.length === 0 ? (
          <p className="body">Tap a line, or Other.</p>
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
                  <LineAmount
                    value={line.amountGbp}
                    onChange={(amountGbp) =>
                      setLines((rows) =>
                        rows.map((r) => (r.id === line.id ? { ...r, amountGbp } : r)),
                      )
                    }
                  />
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
          Ping payment
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

export function CataloguePrices({
  catalogue,
  mode = "defaults",
}: {
  catalogue: CatalogueItem[];
  mode?: "defaults" | "pay";
}) {
  const router = useRouter();
  const trackRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const stock = catalogue.filter((c) => !c.custom);
  const pay = mode === "pay";
  const [amounts, setAmounts] = useState<Record<string, string>>(() =>
    Object.fromEntries(stock.map((c) => [c.id, c.amountGbp === 0 ? "" : String(c.amountGbp)])),
  );
  const [extras, setExtras] = useState<ExtraCharge[]>(() =>
    catalogue
      .filter((c) => c.custom)
      .map((c) => ({ id: c.id, stage: c.stage, name: c.name, amountGbp: c.amountGbp })),
  );
  const [draft, setDraft] = useState<Record<Stage, { name: string; amount: string }>>({
    design: { name: "", amount: "" },
    strategy: { name: "", amount: "" },
    build: { name: "", amount: "" },
  });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setAmounts(
      Object.fromEntries(
        catalogue
          .filter((c) => !c.custom)
          .map((c) => [c.id, c.amountGbp === 0 ? "" : String(c.amountGbp)]),
      ),
    );
    setExtras(
      catalogue
        .filter((c) => c.custom)
        .map((c) => ({ id: c.id, stage: c.stage, name: c.name, amountGbp: c.amountGbp })),
    );
  }, [catalogue]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    function sync() {
      const track = trackRef.current;
      if (!track) return;
      const w = track.clientWidth;
      if (!w) return;
      const i = Math.round(track.scrollLeft / w);
      setSlide(Math.max(0, Math.min(STAGES.length - 1, i)));
    }
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  function goTo(i: number) {
    const track = trackRef.current;
    if (!track) return;
    setSlide(i);
    track.scrollTo({ left: i * track.clientWidth, behavior: "smooth" });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const prices: Record<string, number> = {};
    for (const item of stock) {
      const raw = (amounts[item.id] || "").trim();
      const n = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(n) || n < 0) {
        setError("Amounts have to be zero or more.");
        return;
      }
      prices[item.id] = n;
    }
    const nextExtras = [...extras];
    if (pay) {
      for (const stage of STAGES) {
        const row = draft[stage.id];
        const name = row.name.trim();
        if (!name) continue;
        const n = row.amount.trim() === "" ? 0 : Number(row.amount);
        if (!Number.isFinite(n) || n < 0) {
          setError("Amounts have to be zero or more.");
          return;
        }
        nextExtras.push({
          id: crypto.randomUUID(),
          stage: stage.id,
          name,
          amountGbp: n,
        });
      }
    }
    setPending(true);
    const res = await fetch("/api/billing/prices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pay ? { extras: nextExtras } : { prices }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Amounts didn’t save.");
      return;
    }
    setOk(pay ? "Other saved." : "Amounts saved.");
    setDraft({
      design: { name: "", amount: "" },
      strategy: { name: "", amount: "" },
      build: { name: "", amount: "" },
    });
    router.refresh();
  }

  return (
    <form className="onboard price-book" onSubmit={onSubmit}>
      <p className="body bill-note">
        {pay
          ? "Standing amounts from Settings. Other is a Reason and a Charge for this situation — not a standing default."
          : "Each box has its own amount. Empty is £0. Save here."}
      </p>
      <div className="charge-dots" role="tablist" aria-label="Design, Strategy, Build">
        {STAGES.map((stage, i) => (
          <button
            key={stage.id}
            type="button"
            className={slide === i ? "charge-tab is-on" : "charge-tab"}
            role="tab"
            aria-selected={slide === i}
            onClick={() => goTo(i)}
          >
            {stage.name}
          </button>
        ))}
      </div>
      <div className="charge-track" ref={trackRef} aria-label="What we charge">
        {STAGES.map((stage) => (
          <div key={stage.id} className="charge-col">
            <h3>{stage.name}</h3>
            {stock
              .filter((c) => c.stage === stage.id)
              .map((item) =>
                pay ? (
                  <div key={item.id} className="charge-item">
                    <p className="charge-name">{item.name}</p>
                    <p className="charge-blurb">{item.blurb}</p>
                    <p className="charge-amount">{priceLabel(item.amountGbp)}</p>
                  </div>
                ) : (
                  <div key={item.id} className="charge-item">
                    <label htmlFor={`price-${item.id}`}>{item.name}</label>
                    <p className="charge-blurb">{item.blurb}</p>
                    <div className="charge-box">
                      <span>Charge £</span>
                      <input
                        id={`price-${item.id}`}
                        type="text"
                        inputMode="decimal"
                        value={amounts[item.id] ?? ""}
                        onChange={(e) => {
                          const raw = e.target.value;
                          if (!/^\d*\.?\d{0,2}$/.test(raw) && raw !== "") return;
                          setAmounts((rows) => ({ ...rows, [item.id]: raw }));
                        }}
                        placeholder="0"
                      />
                    </div>
                  </div>
                ),
              )}
            {pay
              ? extras
                  .filter((row) => row.stage === stage.id)
                  .map((row) => (
                    <div key={row.id} className="charge-item">
                      <label htmlFor={`extra-name-${row.id}`}>Reason</label>
                      <input
                        id={`extra-name-${row.id}`}
                        value={row.name}
                        onChange={(e) =>
                          setExtras((rows) =>
                            rows.map((r) =>
                              r.id === row.id ? { ...r, name: e.target.value } : r,
                            ),
                          )
                        }
                      />
                      <div className="charge-box">
                        <span>Charge £</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={row.amountGbp === 0 ? "" : String(row.amountGbp)}
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (!/^\d*\.?\d{0,2}$/.test(raw) && raw !== "") return;
                            setExtras((rows) =>
                              rows.map((r) =>
                                r.id === row.id
                                  ? { ...r, amountGbp: raw === "" ? 0 : Number(raw) }
                                  : r,
                              ),
                            );
                          }}
                          placeholder="0"
                        />
                        <button
                          type="button"
                          className="act-quiet"
                          onClick={() =>
                            setExtras((rows) => rows.filter((r) => r.id !== row.id))
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
              : null}
            {pay ? (
              <div className="charge-item charge-other">
                <label htmlFor={`other-${stage.id}`}>Other</label>
                <input
                  id={`other-${stage.id}`}
                  value={draft[stage.id].name}
                  onChange={(e) =>
                    setDraft((rows) => ({
                      ...rows,
                      [stage.id]: { ...rows[stage.id], name: e.target.value },
                    }))
                  }
                  placeholder="Reason"
                />
                <div className="charge-box">
                  <span>Charge £</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={draft[stage.id].amount}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!/^\d*\.?\d{0,2}$/.test(raw) && raw !== "") return;
                      setDraft((rows) => ({
                        ...rows,
                        [stage.id]: { ...rows[stage.id], amount: raw },
                      }));
                    }}
                    placeholder="0"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <button type="submit" disabled={pending}>
        {pending ? "…" : pay ? "Save other" : "Save amounts"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}

export function PayRailForm({ rail }: { rail: PayRail }) {
  const router = useRouter();
  const [form, setForm] = useState(rail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setForm(rail);
  }, [rail]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    setPending(true);
    const res = await fetch("/api/billing/rail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setPending(false);
    if (!res.ok) {
      setError("Bank details didn’t save.");
      return;
    }
    setOk("Pay details saved.");
    router.refresh();
  }

  function set<K extends keyof PayRail>(key: K, value: string) {
    setForm((row) => ({ ...row, [key]: value }));
  }

  return (
    <form className="onboard" onSubmit={onSubmit}>
      <p className="body bill-note">
        You can save empty. Invoices still issue. How to pay appears on the
        invoice once these fields are filled.
      </p>
      <label htmlFor="rail-name">Account name</label>
      <input
        id="rail-name"
        value={form.accountName}
        onChange={(e) => set("accountName", e.target.value)}
      />
      <label htmlFor="rail-bank">Bank</label>
      <input
        id="rail-bank"
        value={form.bankName}
        onChange={(e) => set("bankName", e.target.value)}
      />
      <label htmlFor="rail-sort">Sort code</label>
      <input
        id="rail-sort"
        value={form.sortCode}
        onChange={(e) => set("sortCode", e.target.value)}
        autoComplete="off"
      />
      <label htmlFor="rail-num">Account number</label>
      <input
        id="rail-num"
        value={form.accountNumber}
        onChange={(e) => set("accountNumber", e.target.value)}
        autoComplete="off"
      />
      <label htmlFor="rail-extra">Note on the invoice</label>
      <textarea
        id="rail-extra"
        rows={3}
        value={form.extra}
        onChange={(e) => set("extra", e.target.value)}
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Save pay details"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}

export function OnlineRailForm({ rail }: { rail: OnlineRail }) {
  const router = useRouter();
  const [autoHost, setAutoHost] = useState(rail.autoHost);
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState("");

  useEffect(() => {
    setAutoHost(rail.autoHost);
  }, [rail.autoHost]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setOk("");
    setPending(true);
    const res = await fetch("/api/billing/online", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ autoHost, provider: "none" }),
    });
    setPending(false);
    if (!res.ok) return;
    setOk("Saved.");
    router.refresh();
  }

  return (
    <form className="onboard" onSubmit={onSubmit}>
      <p className="body bill-note">
        People pay online. The card provider is connected later. Hosting
        invoices already try to collect themselves when a period ends. Receipts
        write when a payment clears.
      </p>
      <label className="check">
        <input
          type="checkbox"
          checked={autoHost}
          onChange={(e) => setAutoHost(e.target.checked)}
        />
        Collect hosting automatically when a week or month rolls
      </label>
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Save"}
      </button>
      {ok ? <p className="note">{ok}</p> : null}
    </form>
  );
}
