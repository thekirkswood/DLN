"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { AskAnswer, Estate } from "@/lib/clock-types";
import { formatLondonDate, formatLondonTime } from "@/lib/clock";
import { ClockBlueprint, ClockPortRuler } from "@/components/ClockBlueprint";

function when(iso: string | null | undefined): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return `${formatLondonDate(iso)} ${formatLondonTime(iso)}`;
}

function toneClass(tone: string): string {
  if (tone === "miss") return "is-miss";
  if (tone === "warn") return "is-warn";
  if (tone === "ok") return "is-ok";
  return "is-idle";
}

export function ClockDesk() {
  const [estate, setEstate] = useState<Estate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [ask, setAsk] = useState("");
  const [answer, setAnswer] = useState<AskAnswer | null>(null);
  const [pane, setPane] = useState<"blueprint" | "sheets" | "brains" | "models" | "logic">("blueprint");

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/clock/estate", {
        cache: "no-store",
        credentials: "include",
      });
      if (res.status === 401 || res.status === 403) {
        setError("Studio only.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("Clock could not reach the overlay.");
        setLoading(false);
        return;
      }
      const data = (await res.json()) as Estate;
      setEstate(data);
      setError("");
      setLoading(false);
    } catch {
      setError("Clock could not reach the overlay.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = window.setInterval(load, 60_000);
    return () => window.clearInterval(id);
  }, [load]);

  async function onAsk(e: FormEvent) {
    e.preventDefault();
    if (!ask.trim()) return;
    const res = await fetch("/api/clock/ask", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: ask }),
    });
    if (!res.ok) {
      setAnswer({
        question: ask,
        known: false,
        title: "Unknown",
        body: "Ask could not run.",
        keys: [],
      });
      return;
    }
    setAnswer((await res.json()) as AskAnswer);
  }

  const pending = useMemo(() => {
    if (!estate) return 0;
    return estate.census
      .filter((r) => r.kind === "agent.inbox.pending")
      .reduce((n, r) => n + r.count, 0);
  }, [estate]);

  if (loading) {
    return (
      <div className="clock-desk">
        <p className="body">Listening…</p>
      </div>
    );
  }

  if (!estate) {
    return (
      <div className="clock-desk">
        <p className="body">{error || "The Clock is quiet."}</p>
      </div>
    );
  }

  return (
    <div className="clock-desk">
      <p className="body bill-note">
        One clock for the estate. Live URLs are the pulse. Facts are labelled{" "}
        {estate.overlay === "lab" ? "lab" : "live"} on this overlay. Watch stays
        the ban UI. {pending ? `${pending} lab notes waiting.` : "Queues idle."}
      </p>

      {estate.live ? (
        <article
          className={`clock-face ${estate.live.ok === false ? "is-miss" : "is-ok"}`}
        >
          <p className="kicker">Live overlay</p>
          <h3>designlabnorth.com</h3>
          <p className="clock-pulse">
            Home dln-{estate.live.homeIteration ?? "?"} · live {estate.live.tag || "no tag yet"}
          </p>
          <p className="status">
            {estate.live.error ||
              `${estate.live.enquiriesOpen} home enquiries · ${estate.live.suggestionsOpen} open notes. This book is the one we edit.`}
          </p>
        </article>
      ) : null}

      <ClockShip />

      <ClockPortRuler blueprint={estate.blueprint} />

      <div className="clock-faces">
        {estate.pulses.map((p) => (
          <article
            key={p.house}
            className={`clock-face ${p.ok === true ? "is-ok" : p.ok === false ? "is-miss" : "is-idle"}`}
          >
            <p className="kicker">{p.house}</p>
            <h3>{p.name}</h3>
            <p className="clock-pulse">
              {p.ok === true ? "Up" : p.ok === false ? "Silent" : "Unknown"}
              {p.latencyMs != null ? ` · ${p.latencyMs}ms` : ""}
            </p>
            <p className="status">
              Pulse {p.source}. Last ok {when(p.lastOk)}. Last miss {when(p.lastMiss)}.
            </p>
            <p className="clock-links">
              <a href={p.liveUrl} target="_blank" rel="noreferrer">
                Home
              </a>
              <a href={p.clockUrl} target="_blank" rel="noreferrer">
                Face
              </a>
            </p>
          </article>
        ))}
      </div>

      <ul className="clock-sits">
        {estate.situations.map((s) => (
          <li key={s.id} className={toneClass(s.tone)}>
            <strong>{s.title}</strong>
            <span>{s.detail}</span>
          </li>
        ))}
      </ul>

      <form className="clock-ask" onSubmit={onAsk}>
        <label>
          <span className="kicker">Ask</span>
          <input
            value={ask}
            onChange={(e) => setAsk(e.target.value)}
            placeholder="What ports are sitting?"
          />
        </label>
        <button type="submit">Ask</button>
      </form>
      {answer ? (
        <div className={`clock-answer ${answer.known ? "is-ok" : "is-miss"}`}>
          <p className="kicker">{answer.title}</p>
          <pre>{answer.body}</pre>
        </div>
      ) : (
        <p className="lede clock-hints">
          {estate.askHints.join(" · ")}
        </p>
      )}

      <nav className="clock-panes" aria-label="Clock layers">
        {(["blueprint", "sheets", "brains", "models", "logic"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className={pane === id ? "is-on" : ""}
            onClick={() => setPane(id)}
          >
            {id === "blueprint" ? "Blueprint" : id === "sheets" ? "Sheets" : id[0].toUpperCase() + id.slice(1)}
          </button>
        ))}
      </nav>

      {pane === "blueprint" ? <ClockBlueprint blueprint={estate.blueprint} /> : null}

      {pane === "sheets" ? (
        <div className="clock-sheet-wrap">
          <table className="clock-sheet">
            <thead>
              <tr>
                <th>House</th>
                <th>Kind</th>
                <th>Count</th>
                <th>First</th>
                <th>Last</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {estate.census.map((r) => (
                <tr key={r.key}>
                  <td>{r.house}</td>
                  <td>{r.kind}</td>
                  <td>{r.count}</td>
                  <td>{when(r.firstAt)}</td>
                  <td>{when(r.lastAt)}</td>
                  <td>{r.lastSummary || r.firstSummary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {pane === "brains" ? (
        <ul className="clock-files">
          {estate.brains.map((b) => (
            <li key={`${b.house}:${b.path}`}>
              <strong>{b.house}</strong> {b.path}
              <span>
                {b.kind} · {b.bytes}B · {when(b.mtime)}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {pane === "models" ? (
        <ul className="clock-files">
          {estate.models.map((m) => (
            <li key={`${m.house}:${m.name}`}>
              <strong>{m.house}</strong> {m.name}
              <span>{m.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {pane === "logic" ? (
        <ul className="clock-files">
          {estate.logic.map((l) => (
            <li key={`${l.house}:${l.id}`}>
              <strong>{l.house}</strong> {l.name}
              <span>{l.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="body">{error}</p> : null}
    </div>
  );
}

function ClockShip() {
  const [notes, setNotes] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function queue(kind: "ship" | "hotfix") {
    const phrase = kind === "hotfix" ? "hotfix" : "push to git and live";
    if (confirm.trim().toLowerCase() !== phrase) {
      setMsg(
        kind === "hotfix"
          ? "Type hotfix to queue a hotfix."
          : "Type push to git and live. Ordinary notes do not deploy.",
      );
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/studio/ship", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, confirm: confirm.trim(), notes }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setMsg(data.error || `Could not queue (${res.status}).`);
        setBusy(false);
        return;
      }
      setConfirm("");
      setNotes("");
      setMsg(
        kind === "hotfix"
          ? "Hotfix queued at the head of the line."
          : "Ship queued. Numbered iteration, git, then live.",
      );
    } catch {
      setMsg("Could not reach the ship desk.");
    }
    setBusy(false);
  }

  return (
    <div className="clock-ship">
      <p className="kicker">Push</p>
      <p className="status">
        Send on the lab still does not deploy. These buttons queue a numbered ship.
      </p>
      <label>
        What this ship is
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      <label>
        Confirm phrase
        <input
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="push to git and live"
        />
      </label>
      <p className="clock-links">
        <button type="button" disabled={busy} onClick={() => queue("ship")}>
          Push to git and live
        </button>
        <button type="button" disabled={busy} onClick={() => queue("hotfix")}>
          Hotfix
        </button>
      </p>
      {msg ? <p className="status">{msg}</p> : null}
    </div>
  );
}
