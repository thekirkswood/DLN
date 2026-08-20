"use client";

import { FormEvent, Suspense, useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { InvoiceComposer, ConvertTitles } from "@/components/InvoiceDesk";
import { BookApp, InvoiceBoard } from "@/components/BookApp";
import { SettingsDesk } from "@/components/SettingsDesk";
import { PayDesk } from "@/components/PayDesk";
import { OnboardDesk } from "@/components/OnboardDesk";
import { AvatarSlot } from "@/components/AccountBilling";
import { type CatalogueItem } from "@/data/catalogue";
import type { Invoice, PayRail, Payment, Roll, OnlineRail } from "@/lib/billing";
import type { StudioSettings } from "@/lib/settings";
import { enterUrlFor, hostUrlFor, type Plot } from "@/lib/plot-urls";
import { labStationPath } from "@/lib/lab-host";
import type { Enquiry } from "@/lib/enquiries";
import type { BuildPlan, SiteComment } from "@/lib/plans";
import type { PublicUser } from "@/lib/auth";

type Person = PublicUser;
type DeskRoom = "clients" | "onboarding" | "book" | "pay" | "settings";

const ROOMS: DeskRoom[] = ["clients", "onboarding", "book", "pay", "settings"];

function asRoom(raw: string | null, fallback: DeskRoom): DeskRoom {
  return ROOMS.includes(raw as DeskRoom) ? (raw as DeskRoom) : fallback;
}

type DeskProps = {
  people: Person[];
  plots: Plot[];
  enquiries: Enquiry[];
  invoices: Invoice[];
  comments: SiteComment[];
  plans: BuildPlan[];
  lab?: boolean;
  catalogue: CatalogueItem[];
  rail: PayRail;
  claims: Record<string, Payment>;
  rolls?: Roll[];
  online?: OnlineRail;
  settings: StudioSettings;
};

export function StudioDesk(props: DeskProps) {
  return (
    <Suspense fallback={<div className="studio-desk" />}>
      <StudioDeskLive {...props} />
    </Suspense>
  );
}

function StudioDeskLive({
  people,
  plots,
  enquiries,
  invoices,
  comments,
  plans,
  lab = false,
  catalogue,
  rail,
  claims,
  rolls = [],
  online = { provider: "none", autoHost: true, note: "" },
  settings,
}: DeskProps) {
  const router = useRouter();
  const path = usePathname() || "/lab";
  const params = useSearchParams();
  const waiting = enquiries.filter((e) => e.status === "new");
  const fallback: DeskRoom = waiting.length ? "onboarding" : "clients";
  const desk = asRoom(params.get("desk"), fallback);
  const who = params.get("who") || "";
  const person = people.find((p) => p.id === who) || null;

  function go(nextDesk: DeskRoom, nextWho: string | null = who || null) {
    const q = new URLSearchParams();
    q.set("desk", nextDesk);
    if (nextWho) q.set("who", nextWho);
    router.replace(`${path}?${q.toString()}`, { scroll: false });
  }

  const rooms: { id: DeskRoom; name: string; hint: string }[] = [
    {
      id: "clients",
      name: "Clients",
      hint: people.length ? `${people.length} on the book` : "None yet",
    },
    {
      id: "onboarding",
      name: "Onboarding",
      hint: waiting.length ? `${waiting.length} waiting` : "Quiet",
    },
    { id: "book", name: "Book", hint: "Diaries" },
    {
      id: "pay",
      name: "Pay",
      hint: person ? person.displayName : "Choose a client",
    },
    { id: "settings", name: "Settings", hint: "Amounts" },
  ];

  return (
    <div className="studio-desk">
      <nav className="desk-rooms" aria-label="Accounts">
        {rooms.map((room) => (
          <button
            key={room.id}
            type="button"
            className={desk === room.id ? "desk-room is-on" : "desk-room"}
            aria-current={desk === room.id ? "page" : undefined}
            onClick={() => go(room.id, person?.id || null)}
          >
            <span className="desk-room-name">{room.name}</span>
            <span className="desk-room-hint">{room.hint}</span>
          </button>
        ))}
      </nav>

      {desk === "pay" || person ? (
        <div className="desk-serving">
          <p className="kicker desk-serving-kicker">Serving</p>
          <label className="desk-serving-pick">
            <span className="visually-hidden">Client</span>
            <select
              value={person?.id || ""}
              onChange={(e) => go(desk, e.target.value || null)}
            >
              <option value="">Choose a client</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName}
                </option>
              ))}
            </select>
          </label>
          {person ? (
            <button type="button" className="desk-serving-close" onClick={() => go(desk, null)}>
              Close
            </button>
          ) : null}
        </div>
      ) : null}

      {desk === "clients" ? (
        <div className={`desk-clients${person ? " is-serving" : ""}`}>
          <div className="client-pick">
            {people.length === 0 ? (
              <p className="body">Nobody on the book yet. Onboarding brings them in.</p>
            ) : (
              people.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className={`lift-plate client-plate${person?.id === p.id ? " is-on" : ""}`}
                  style={{ "--d": i } as CSSProperties}
                  onClick={() => go("clients", p.id)}
                >
                  <span className="lift-plate-face client-plate-face">
                    <AvatarSlot userId={p.id} hasAvatar={Boolean(p.avatar)} forOthers />
                    <span>
                      <strong>{p.displayName}</strong>
                      <span className="status">{p.email}</span>
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
          {person ? (
            <PersonPanel
              person={person}
              plots={plots}
              invoices={invoices.filter((i) => i.userId === person.id)}
              comments={comments.filter((c) => c.userId === person.id)}
              plans={plans.filter((p) => p.userId === person.id)}
              people={people}
              lab={lab}
              catalogue={catalogue}
              claims={claims}
              graceDays={settings.graceDays}
              onCharge={() => go("pay", person.id)}
            />
          ) : (
            <p className="body bill-note desk-clients-hint">
              Open a client. That is our dossier — not their account. Rooms stay
              up here. Pay keeps whoever you are serving.
            </p>
          )}
        </div>
      ) : null}

      {desk === "onboarding" ? (
        <OnboardDesk enquiries={enquiries} plots={plots} lab={lab} />
      ) : null}

      {desk === "book" ? (
        <BookApp
          invoices={invoices}
          people={people}
          plots={plots}
          claims={claims}
          rolls={rolls}
          lab={lab}
          graceDays={settings.graceDays}
        />
      ) : null}

          {desk === "pay" ? (
            <PayDesk
              catalogue={catalogue}
              people={people}
              plots={plots}
              invoices={person ? invoices.filter((i) => i.userId === person.id) : []}
              claims={claims}
              graceDays={settings.graceDays}
              servingId={person?.id || ""}
            />
          ) : null}

          {desk === "settings" ? (
            <SettingsDesk
              settings={settings}
              catalogue={catalogue}
              rail={rail}
              online={online}
            />
          ) : null}
    </div>
  );
}

function BuildList({ plots, lab = false }: { plots: Plot[]; lab?: boolean }) {
  const rows = plots.filter(
    (p) => hostUrlFor(p) || enterUrlFor(p) || p.localPreview || p.lab?.housePath,
  );
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
              {lab && plot.lab?.housePath && plot.lab.localPort ? (
                <Link href={labStationPath(plot.slug)}>Open here</Link>
              ) : lab && plot.lab?.housePath ? (
                <span className="status">Folder on disk. Open in Cursor.</span>
              ) : null}
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
  lab = false,
  catalogue,
  claims,
  graceDays = 7,
  onCharge,
}: {
  person: Person;
  plots: Plot[];
  invoices: Invoice[];
  comments: SiteComment[];
  plans: BuildPlan[];
  people: Person[];
  lab?: boolean;
  catalogue: CatalogueItem[];
  claims: Record<string, Payment>;
  graceDays?: number;
  onCharge?: () => void;
}) {
  const [tab, setTab] = useState<"profile" | "work" | "billing">("profile");
  const theirPlots = plots.filter(
    (p) => person.plots.includes("*") || person.plots.includes(p.slug),
  );
  const plotOpts = plots
    .filter((p) => p.party === "client")
    .map((p) => ({ slug: p.slug, name: p.name }));
  const defaultPlot = theirPlots[0]?.slug || plotOpts[0]?.slug || "";
  const openNotes = comments.filter((c) => !c.planId);
  const titlesHref = lab ? labStationPath("various-titles") : "https://varioustitles.com";

  return (
    <div className="person-panel">
      <div className="person-head">
        <AvatarSlot userId={person.id} hasAvatar={Boolean(person.avatar)} forOthers />
        <p className="lede person-lede">
          {person.displayName}
          {person.personalEmail ? ` · mailbox ${person.personalEmail}` : ""}
          {person.phone ? ` · ${person.phone}` : ""}
        </p>
      </div>

      <div className="person-rooms" role="tablist">
        {(
          [
            ["profile", "Profile"],
            ["work", "Work"],
            ["billing", "Billing"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "is-on" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" ? (
        <>
          {person.notes ? <p className="body">{person.notes}</p> : null}
          {person.puppet ? (
            <p className="body bill-note">
              Offline puppet for campus / localhost only — so we can see a
              client account before deployment. Sign in on the lab host with the
              existing password in the gitignored sheet (or campus ops-secrets).
              Do not mail, display, or regenerate a login for her.
            </p>
          ) : person.hubLogin === false ? (
            <p className="body bill-note">
              Lives on the live host. No campus or hub login — they will not
              sign in here.
            </p>
          ) : null}
          <h3>Their sites</h3>
          {theirPlots.length === 0 ? (
            <p className="body">No site bound yet.</p>
          ) : (
            <BuildList plots={theirPlots} lab={lab} />
          )}
          <h3>Notes they left</h3>
          <p className="body bill-note">
            Account notes, and suggestions from the live host. Sweep them into
            one plan, run it offline, upload when it is right. The live box is
            not an editor.
          </p>
          {openNotes.length === 0 ? (
            <p className="body">None waiting to sweep.</p>
          ) : (
            <ul className="note-list">
              {openNotes.map((c) => (
                <li key={c.id}>
                  <span className="status">{c.createdAt.slice(0, 10)}</span>
                  {c.source === "live" ? " · live host" : ""}
                  {c.fromName ? ` · ${c.fromName}` : ""}
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
            hint="Add a note from a call. They leave suggestions on the live host."
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
        </>
      ) : null}

      {tab === "work" ? (
        <>
          <p className="body bill-note">
            A.P.E.S. generations, Logic versions, and resources for each stage
            — plus the door into Various Titles. Add a title and a link as the
            work lands.
          </p>
          <p className="body">
            <Link href={titlesHref}>Enter Various Titles</Link>
            {" · "}
            <Link href="/greenhouse/various-titles">Greenhouse story</Link>
          </p>
          <ConvertTitles people={people} fixedUserId={person.id} />
          <WorkFiles userId={person.id} />
        </>
      ) : null}

      {tab === "billing" ? (
        <>
          <p className="body bill-note">
            Their invoices. Same list as Pay — tap a line to add it, Ping
            sends them to pay online.
            {onCharge ? (
              <>
                {" "}
                <button type="button" className="desk-inline" onClick={onCharge}>
                  Open on Pay
                </button>
              </>
            ) : null}
          </p>
          <InvoiceBoard invoices={invoices} studio claims={claims} people={people} graceDays={graceDays} />
          <p className="body bill-note book-compose-note">
            Issue stamps today’s UK date. They have {graceDays} days. A weekly or
            monthly line rolls the next invoice when that period ends.
          </p>
          <InvoiceComposer
            people={people}
            plots={plotOpts}
            fixedUserId={person.id}
            catalogue={catalogue}
            graceDays={graceDays}
          />
        </>
      ) : null}
    </div>
  );
}

type WorkStage = "apes" | "design" | "strategy" | "build" | "titles";

const WORK_STAGES: { id: WorkStage; name: string }[] = [
  { id: "apes", name: "A.P.E.S." },
  { id: "design", name: "Design" },
  { id: "strategy", name: "Strategy" },
  { id: "build", name: "Build" },
  { id: "titles", name: "Various Titles" },
];

function WorkFiles({ userId }: { userId: string }) {
  const [who, setWho] = useState("");
  const [resources, setResources] = useState<
    { id: string; stage: WorkStage; title: string; url?: string; note?: string; createdAt: string }[]
  >([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [stage, setStage] = useState<WorkStage>("apes");
  const [pending, setPending] = useState(false);

  async function load() {
    const res = await fetch(`/api/studio/dossier?userId=${encodeURIComponent(userId)}`, {
      cache: "no-store",
    });
    const data = (await res.json().catch(() => null)) as {
      dossier?: { who?: string; resources?: typeof resources };
    } | null;
    if (!res.ok || !data?.dossier) return;
    setWho(data.dossier.who || "");
    setResources(data.dossier.resources || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function saveWho() {
    setPending(true);
    await fetch("/api/studio/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, who }),
    });
    setPending(false);
  }

  async function add(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    const res = await fetch("/api/studio/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, title, url, note, stage }),
    });
    setPending(false);
    if (!res.ok) return;
    setTitle("");
    setUrl("");
    setNote("");
    await load();
  }

  async function remove(id: string) {
    setPending(true);
    await fetch("/api/studio/dossier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, removeId: id }),
    });
    setPending(false);
    await load();
  }

  return (
    <div className="work-files">
      <h3>Who they are</h3>
      <label htmlFor="who-they">Studio note</label>
      <textarea
        id="who-they"
        rows={3}
        value={who}
        onChange={(e) => setWho(e.target.value)}
      />
      <div className="actions">
        <button type="button" disabled={pending} onClick={saveWho}>
          {pending ? "…" : "Save"}
        </button>
      </div>
      <h3>Resources</h3>
      {WORK_STAGES.map((s) => {
        const rows = resources.filter((r) => r.stage === s.id);
        return (
          <div key={s.id} className="work-stage">
            <h4>{s.name}</h4>
            {rows.length === 0 ? (
              <p className="body">Nothing filed yet.</p>
            ) : (
              <ul className="note-list">
                {rows.map((r) => (
                  <li key={r.id}>
                    <strong>{r.title}</strong>
                    {r.url ? (
                      <>
                        {" · "}
                        <a href={r.url} target="_blank" rel="noreferrer">
                          Open
                        </a>
                      </>
                    ) : null}
                    {r.note ? <p>{r.note}</p> : null}
                    <button
                      type="button"
                      className="act-quiet"
                      disabled={pending}
                      onClick={() => remove(r.id)}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
      <form className="onboard" onSubmit={add}>
        <label htmlFor="res-stage">Stage</label>
        <select
          id="res-stage"
          value={stage}
          onChange={(e) => setStage(e.target.value as WorkStage)}
        >
          {WORK_STAGES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <label htmlFor="res-title">Title</label>
        <input
          id="res-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <label htmlFor="res-url">Link</label>
        <input
          id="res-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <label htmlFor="res-note">Note</label>
        <textarea
          id="res-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <button type="submit" disabled={pending}>
          {pending ? "…" : "File it"}
        </button>
      </form>
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

export function InvoiceList({
  invoices,
  studio,
  claims = {},
  graceDays = 7,
}: {
  invoices: Invoice[];
  studio: boolean;
  claims?: Record<string, Payment>;
  graceDays?: number;
}) {
  return <InvoiceBoard invoices={invoices} studio={studio} claims={claims} graceDays={graceDays} />;
}
