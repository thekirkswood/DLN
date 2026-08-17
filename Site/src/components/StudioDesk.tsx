"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InvoiceComposer, ConvertTitles } from "@/components/InvoiceDesk";
import {
  CloseEnquiry,
  IssueButton,
  PayButton,
  VoidButton,
} from "@/components/AccountBilling";
import { formatGbp } from "@/data/catalogue";
import type { Invoice } from "@/lib/billing";
import { localHandleFromName } from "@/lib/handles";
import { enterUrlFor, hostUrlFor, type Plot } from "@/lib/plot-urls";
import type { Enquiry } from "@/lib/enquiries";
import type { BuildPlan, SiteComment } from "@/lib/plans";
import type { PublicUser } from "@/lib/auth";

type Person = PublicUser;

function totalOf(inv: Invoice): number {
  return inv.lines.reduce((sum, l) => sum + (l.waived ? 0 : l.amountGbp), 0);
}

export function StudioDesk({
  people,
  plots,
  enquiries,
  invoices,
  comments,
  plans,
}: {
  people: Person[];
  plots: Plot[];
  enquiries: Enquiry[];
  invoices: Invoice[];
  comments: SiteComment[];
  plans: BuildPlan[];
}) {
  const waiting = enquiries.filter((e) => e.status === "new");
  const [personId, setPersonId] = useState(people[0]?.id || "");
  const [fromEnquiry, setFromEnquiry] = useState<Enquiry | null>(null);
  const person = people.find((p) => p.id === personId) || null;

  return (
    <div className="studio-desk">
      <h2>Current builds</h2>
      <p className="body bill-note">
        Jump in and look. Public site if there is one; our host is the growing
        copy on this VPS.
      </p>
      <BuildList plots={plots} />

      <h2>Waiting</h2>
      <p className="body bill-note">
        Someone wrote in. Read it, then bring them onto the book from what they
        already told us.
      </p>
      {waiting.length === 0 ? (
        <p className="body">Nobody waiting.</p>
      ) : (
        <div className="bill-table">
          {waiting.map((row) => (
            <div key={row.id} className="bill-row enquire-row">
              <div>
                <strong>{row.name}</strong>
                <span className="status">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ""}
                </span>
                <p className="body">{row.needLabel}</p>
                {row.message ? <p className="body">{row.message}</p> : null}
              </div>
              <div className="bill-pay">
                <button
                  type="button"
                  onClick={() => {
                    setFromEnquiry(row);
                    document.getElementById("bring-on")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  Bring on
                </button>
                <CloseEnquiry id={row.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 id="bring-on">Bring someone on</h2>
      <BringOnForm
        plots={plots.filter((p) => p.party === "client")}
        enquiry={fromEnquiry}
        onClearEnquiry={() => setFromEnquiry(null)}
        onCreated={(id) => setPersonId(id)}
      />

      <h2>A person</h2>
      <p className="body bill-note">
        Pick someone. Their sites, notes, plan, and invoice live in here.
      </p>
      <label htmlFor="desk-person">Who</label>
      <select
        id="desk-person"
        className="desk-pick"
        value={personId}
        onChange={(e) => setPersonId(e.target.value)}
      >
        {people.length === 0 ? <option value="">Nobody on the book yet</option> : null}
        {people.map((p) => (
          <option key={p.id} value={p.id}>
            {p.displayName} · {p.email}
          </option>
        ))}
      </select>

      {person ? (
        <PersonPanel
          person={person}
          plots={plots}
          invoices={invoices.filter((i) => i.userId === person.id)}
          comments={comments.filter((c) => c.userId === person.id)}
          plans={plans.filter((p) => p.userId === person.id)}
          people={people}
        />
      ) : (
        <p className="body">Bring someone on, then they appear here.</p>
      )}
    </div>
  );
}

function BuildList({ plots }: { plots: Plot[] }) {
  const rows = plots.filter((p) => hostUrlFor(p) || enterUrlFor(p) || p.localPreview);
  if (!rows.length) return <p className="body">No builds to open yet.</p>;
  return (
    <div className="build-list">
      {rows.map((plot) => {
        const pub = enterUrlFor(plot);
        const host = hostUrlFor(plot);
        const same = pub && host && pub.replace(/\/$/, "") === host.replace(/\/$/, "");
        return (
          <div key={plot.slug} className="build-row">
            <div>
              <strong>{plot.name}</strong>
              <span className="status">
                {plot.party === "studio" ? "ours" : "client"} · {plot.status}
              </span>
            </div>
            <div className="build-jumps">
              {pub && !same ? (
                <a href={pub} target="_blank" rel="noreferrer">
                  Public
                </a>
              ) : null}
              {host ? (
                <a href={host} target="_blank" rel="noreferrer">
                  {same ? "Open" : "Our host"}
                </a>
              ) : pub ? (
                <a href={pub} target="_blank" rel="noreferrer">
                  Open
                </a>
              ) : (
                <Link href={plot.localPreview}>Story</Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PersonPanel({
  person,
  plots,
  invoices,
  comments,
  plans,
  people,
}: {
  person: Person;
  plots: Plot[];
  invoices: Invoice[];
  comments: SiteComment[];
  plans: BuildPlan[];
  people: Person[];
}) {
  const theirPlots = plots.filter(
    (p) => person.plots.includes("*") || person.plots.includes(p.slug),
  );
  const plotOpts = plots
    .filter((p) => p.party === "client")
    .map((p) => ({ slug: p.slug, name: p.name }));
  const defaultPlot = theirPlots[0]?.slug || plotOpts[0]?.slug || "";
  const openNotes = comments.filter((c) => !c.planId);

  return (
    <div className="person-panel">
      <p className="lede person-lede">
        {person.displayName}
        {person.personalEmail ? ` · mailbox ${person.personalEmail}` : ""}
        {person.phone ? ` · ${person.phone}` : ""}
      </p>
      {person.notes ? <p className="body">{person.notes}</p> : null}

      <h3>Their sites</h3>
      {theirPlots.length === 0 ? (
        <p className="body">No site bound yet.</p>
      ) : (
        <BuildList plots={theirPlots} />
      )}

      <h3>Notes they left</h3>
      <p className="body bill-note">
        Overall notes on this book. The agent reads these, sweeps them into one
        plan, and we run that plan offline — then we upload when it is right.
      </p>
      {openNotes.length === 0 ? (
        <p className="body">None waiting to sweep.</p>
      ) : (
        <ul className="note-list">
          {openNotes.map((c) => (
            <li key={c.id}>
              <span className="status">{c.createdAt.slice(0, 10)}</span>
              {c.page ? ` · ${c.page}` : ""}
              <p>{c.body}</p>
            </li>
          ))}
        </ul>
      )}
      <CommentBox
        plotSlug={defaultPlot}
        plotOptions={theirPlots.length ? theirPlots : plots.filter((p) => p.party === "client")}
        clientId={person.id}
        hint="Add a note from a call, or they leave their own from their account."
      />
      {defaultPlot ? (
        <SweepButton userId={person.id} plotSlug={defaultPlot} disabled={!openNotes.length} />
      ) : null}

      <h3>Plan</h3>
      {plans.length === 0 ? (
        <p className="body">No plan yet. Sweep the notes when you are ready.</p>
      ) : (
        plans.map((plan) => <PlanCard key={plan.id} plan={plan} />)
      )}

      <h3>Invoice</h3>
      <p className="body bill-note">
        What the work actually was. Design, Strategy, or Build — pick the
        lines, waive if you need, issue.
      </p>
      <InvoiceList invoices={invoices} studio />
      <InvoiceComposer people={people} plots={plotOpts} fixedUserId={person.id} />

      <h3>Various Titles</h3>
      <ConvertTitles people={people} fixedUserId={person.id} />
    </div>
  );
}

function SweepButton({
  userId,
  plotSlug,
  disabled,
}: {
  userId: string;
  plotSlug: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSweep() {
    setError("");
    setPending(true);
    const res = await fetch("/api/plans/sweep", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, plotSlug }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Nothing to sweep, or it didn’t take.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="actions">
      <button type="button" disabled={pending || disabled} onClick={onSweep}>
        {pending ? "…" : "Sweep into a plan"}
      </button>
      {error ? <p className="err">{error}</p> : null}
    </div>
  );
}

function PlanCard({ plan }: { plan: BuildPlan }) {
  const router = useRouter();
  const [body, setBody] = useState(plan.body);
  const [title, setTitle] = useState(plan.title);
  const [patch, setPatch] = useState(plan.patchNotes || "");
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    await fetch("/api/plans/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, title, body, patchNotes: patch }),
    });
    setPending(false);
    router.refresh();
  }

  async function setStatus(status: BuildPlan["status"]) {
    setPending(true);
    await fetch("/api/plans/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: plan.id, status }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <div className={`plan-card is-${plan.status}`}>
      <p className="status">{plan.status}</p>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label>
        Plan
        <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
      </label>
      <label>
        Patch notes
        <textarea rows={4} value={patch} onChange={(e) => setPatch(e.target.value)} />
      </label>
      <div className="actions">
        <button type="button" disabled={pending} onClick={save}>
          Save
        </button>
        {plan.status === "draft" ? (
          <button type="button" disabled={pending} onClick={() => setStatus("ready")}>
            Ready to run offline
          </button>
        ) : null}
        {plan.status === "ready" ? (
          <button type="button" disabled={pending} onClick={() => setStatus("shipped")}>
            Shipped
          </button>
        ) : null}
        {plan.status !== "draft" ? (
          <button type="button" className="act-quiet" disabled={pending} onClick={() => setStatus("draft")}>
            Back to draft
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function CommentBox({
  plotSlug,
  plotOptions,
  hint,
  clientId,
}: {
  plotSlug: string;
  plotOptions: Plot[];
  hint?: string;
  clientId?: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(plotSlug);
  const [body, setBody] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!slug || !body.trim()) return;
    setPending(true);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plotSlug: slug, body, clientId }),
    });
    setPending(false);
    if (!res.ok) return;
    setBody("");
    router.refresh();
  }

  if (!plotOptions.length && !plotSlug) return null;

  return (
    <form className="comment-box" onSubmit={onSubmit}>
      {hint ? <p className="body bill-note">{hint}</p> : null}
      {plotOptions.length > 1 ? (
        <>
          <label htmlFor="c-plot">Site</label>
          <select id="c-plot" value={slug} onChange={(e) => setSlug(e.target.value)}>
            {plotOptions.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </>
      ) : null}
      <label htmlFor="c-body">A note</label>
      <textarea
        id="c-body"
        rows={3}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
      />
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Leave note"}
      </button>
    </form>
  );
}

function BringOnForm({
  plots,
  enquiry,
  onClearEnquiry,
  onCreated,
}: {
  plots: Plot[];
  enquiry: Enquiry | null;
  onClearEnquiry: () => void;
  onCreated: (id: string) => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [cred, setCred] = useState<{
    email: string;
    password: string;
    personalEmail: string | null;
    mailed: boolean;
  } | null>(null);
  const [name, setName] = useState(enquiry?.name || "");
  const [mailbox, setMailbox] = useState(enquiry?.email || "");
  const [phone, setPhone] = useState(enquiry?.phone || "");
  const [notes, setNotes] = useState(
    enquiry ? [enquiry.needLabel, enquiry.message].filter(Boolean).join("\n") : "",
  );
  const [usePersonal, setUsePersonal] = useState(false);

  useEffect(() => {
    if (!enquiry) return;
    setName(enquiry.name);
    setMailbox(enquiry.email);
    setPhone(enquiry.phone || "");
    setNotes([enquiry.needLabel, enquiry.message].filter(Boolean).join("\n"));
  }, [enquiry]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCred(null);
    const form = new FormData(e.currentTarget);
    const picked = form.getAll("plots").map(String);
    setPending(true);
    const res = await fetch("/api/studio/onboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enquiryId: enquiry?.id,
        displayName: name,
        personalEmail: mailbox,
        phone,
        notes,
        plots: picked,
        usePersonalLogin: usePersonal,
      }),
    });
    const data = (await res.json().catch(() => null)) as {
      id?: string;
      email?: string;
      password?: string;
      personalEmail?: string | null;
      mailed?: boolean;
    } | null;
    setPending(false);
    if (!res.ok || !data?.id || !data.email || !data.password) {
      setError(res.status === 409 ? "That login is already on the book." : "Bring-on didn’t take.");
      return;
    }
    setCred({
      email: data.email,
      password: data.password,
      personalEmail: data.personalEmail || null,
      mailed: Boolean(data.mailed),
    });
    onCreated(data.id);
    onClearEnquiry();
    router.refresh();
  }

  const previewLogin = usePersonal
    ? mailbox || "their mailbox"
    : localHandleFromName(name || "client");

  return (
    <form className="onboard" onSubmit={onSubmit}>
      {enquiry ? (
        <p className="body bill-note">
          From {enquiry.name}. We keep what they wrote. We make a login and a
          password, and send them to their mailbox.
          {" "}
          <button type="button" className="act-quiet" onClick={onClearEnquiry}>
            Clear
          </button>
        </p>
      ) : (
        <p className="body bill-note">
          We make the login and password. Their mailbox is where we send it.
          Default login is a <code>@designlabnorth.local</code> handle — not a
          mailbox, the name on this book.
        </p>
      )}
      <label htmlFor="bo-name">Name</label>
      <input
        id="bo-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <label htmlFor="bo-mail">Their mailbox</label>
      <input
        id="bo-mail"
        type="email"
        value={mailbox}
        onChange={(e) => setMailbox(e.target.value)}
        required
      />
      <label htmlFor="bo-phone">Phone</label>
      <input
        id="bo-phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <label htmlFor="bo-notes">What they asked</label>
      <textarea
        id="bo-notes"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <label className="check">
        <input
          type="checkbox"
          checked={usePersonal}
          onChange={(e) => setUsePersonal(e.target.checked)}
        />
        Use their mailbox as the login
      </label>
      <p className="body bill-note">Login will be {previewLogin}. Password is made for them.</p>
      <fieldset>
        <legend>Bind a site</legend>
        {plots.length === 0 ? (
          <p className="body">No client plots yet — they can still go on the book.</p>
        ) : (
          plots.map((p) => (
            <label key={p.slug} className="check">
              <input type="checkbox" name="plots" value={p.slug} />
              {p.name}
            </label>
          ))
        )}
      </fieldset>
      <button type="submit" disabled={pending}>
        {pending ? "…" : "Make their login"}
      </button>
      {error ? <p className="err">{error}</p> : null}
      {cred ? (
        <div className="cred-card">
          <p className="body">
            {cred.mailed
              ? `Sent to ${cred.personalEmail}. Copy is here if you need it.`
              : `Mail didn’t send (no SMTP). Send this to ${cred.personalEmail || "them"} yourselves.`}
          </p>
          <p>
            <strong>Login</strong> {cred.email}
          </p>
          <p>
            <strong>Password</strong> {cred.password}
          </p>
        </div>
      ) : null}
    </form>
  );
}

export function InvoiceList({
  invoices,
  studio,
}: {
  invoices: Invoice[];
  studio: boolean;
}) {
  if (invoices.length === 0) {
    return <p className="body">No invoices yet.</p>;
  }
  return (
    <div className="bill-table">
      {invoices.map((inv) => (
        <div key={inv.id} className="bill-row">
          <div>
            <Link href={`/account/invoices/${inv.id}`}>
              <strong>{inv.number}</strong>
            </Link>
            <span className="status">{inv.status}</span>
          </div>
          <div>{formatGbp(totalOf(inv))}</div>
          <div className="bill-pay">
            {inv.status === "due" ? <PayButton invoiceId={inv.id} /> : null}
            {studio && inv.status === "draft" ? <IssueButton invoiceId={inv.id} /> : null}
            {studio && (inv.status === "draft" || inv.status === "due") ? (
              <VoidButton invoiceId={inv.id} />
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
