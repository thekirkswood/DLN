"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseEnquiry } from "@/components/AccountBilling";
import { formatLondonDate } from "@/lib/clock";
import { localHandleFromName } from "@/lib/handles";
import type { Enquiry } from "@/lib/enquiries";
import type { Plot } from "@/lib/plot-urls";

type Cred = {
  email: string;
  password: string;
  personalEmail: string | null;
  mailed: boolean;
  puppet?: boolean;
  housePath?: string;
};

export function OnboardDesk({
  enquiries,
  plots,
  lab = false,
}: {
  enquiries: Enquiry[];
  plots: Plot[];
  lab?: boolean;
}) {
  const open = enquiries.filter((e) => e.status === "new");
  const done = enquiries.filter((e) => e.status !== "new");
  const clientPlots = plots.filter((p) => p.party === "client");

  return (
    <div className="onboard-desk">
      <p className="body bill-note">
        Each form fill on Design, Strategy, or Build lands here as its own
        card. Check what they wrote — you will have spoken to them — then make
        the login. A new house is a folder on disk. Open that folder in Cursor
        yourselves; this desk cannot start that chat.
      </p>
      {open.length === 0 ? (
        <p className="body">Nobody in onboarding.</p>
      ) : (
        <div className="onboard-grid">
          {open.map((row) => (
            <OnboardCard key={row.id} enquiry={row} plots={clientPlots} lab={lab} />
          ))}
        </div>
      )}
      <h2 id="bring-on">Walk-in</h2>
      <p className="body bill-note">
        Someone who did not write in. Same book, same login.
      </p>
      <OnboardCard enquiry={null} plots={clientPlots} lab={lab} />
      {done.length ? (
        <details className="book-fold enquire-fold">
          <summary>Earlier instances ({done.length})</summary>
          <div className="onboard-grid">
            {done.map((row) => (
              <div key={row.id} className="onboard-card is-done">
                <p className="onboard-card-facet">
                  {row.facet} · {row.status}
                </p>
                <strong>{row.name}</strong>
                <p className="status">
                  {row.email}
                  {row.phone ? ` · ${row.phone}` : ""}
                </p>
                <p className="body">{row.needLabel}</p>
                <p className="status">{formatLondonDate(row.createdAt)}</p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function OnboardCard({
  enquiry,
  plots,
  lab,
}: {
  enquiry: Enquiry | null;
  plots: Plot[];
  lab: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState("");
  const [error, setError] = useState("");
  const [cred, setCred] = useState<Cred | null>(null);
  const [name, setName] = useState(enquiry?.name || "");
  const [mailbox, setMailbox] = useState(enquiry?.email || "");
  const [phone, setPhone] = useState(enquiry?.phone || "");
  const [notes, setNotes] = useState(
    enquiry ? [enquiry.needLabel, enquiry.message].filter(Boolean).join("\n") : "",
  );
  const [usePersonal, setUsePersonal] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [houseName, setHouseName] = useState(enquiry?.name || "");

  useEffect(() => {
    if (!enquiry) return;
    setName(enquiry.name);
    setMailbox(enquiry.email);
    setPhone(enquiry.phone || "");
    setNotes([enquiry.needLabel, enquiry.message].filter(Boolean).join("\n"));
    setHouseName(enquiry.name);
  }, [enquiry]);

  async function saveDetails(e: FormEvent) {
    e.preventDefault();
    if (!enquiry) return;
    setError("");
    setPending("save");
    const res = await fetch("/api/enquiries", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: enquiry.id,
        name,
        email: mailbox,
        phone,
        message: notes,
      }),
    });
    setPending("");
    if (!res.ok) {
      setError("Couldn’t save those details.");
      return;
    }
    router.refresh();
  }

  async function makeLogin(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCred(null);
    setPending("login");
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
      puppet?: boolean;
    } | null;
    setPending("");
    if (!res.ok || !data?.id || !data.email) {
      setError(res.status === 409 ? "That login is already on the book." : "Bring-on didn’t take.");
      return;
    }
    if (data.puppet) {
      setCred({
        email: data.email,
        password: "",
        personalEmail: data.personalEmail || null,
        mailed: false,
        puppet: true,
      });
      router.refresh();
      return;
    }
    if (!data.password) {
      setError("Bring-on didn’t take.");
      return;
    }
    setCred({
      email: data.email,
      password: data.password,
      personalEmail: data.personalEmail || null,
      mailed: Boolean(data.mailed),
    });
    router.refresh();
  }

  async function makeHouse() {
    if (!lab) return;
    setError("");
    setPending("house");
    const res = await fetch("/api/lab/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: houseName || name, party: "client" }),
    });
    const data = (await res.json().catch(() => null)) as {
      housePath?: string;
      error?: string;
    } | null;
    setPending("");
    if (!res.ok || !data?.housePath) {
      setError(
        res.status === 409
          ? "That house already exists. Open the folder in Cursor."
          : "Couldn’t make the folder.",
      );
      return;
    }
    setCred((row) =>
      row
        ? { ...row, housePath: data.housePath }
        : {
            email: "",
            password: "",
            personalEmail: mailbox || null,
            mailed: false,
            housePath: data.housePath,
          },
    );
    router.refresh();
  }

  const previewLogin = usePersonal
    ? mailbox || "their mailbox"
    : localHandleFromName(name || "client");

  return (
    <article className="onboard-card">
      {enquiry ? (
        <>
          <p className="onboard-card-facet">{enquiry.facet}</p>
          <p className="status">{formatLondonDate(enquiry.createdAt)}</p>
          <p className="body">{enquiry.needLabel}</p>
          {enquiry.message ? <p className="body">{enquiry.message}</p> : null}
        </>
      ) : (
        <p className="onboard-card-facet">Walk-in</p>
      )}
      <form
        className="onboard"
        onSubmit={enquiry ? saveDetails : (e) => e.preventDefault()}
      >
        <label htmlFor={`ob-name-${enquiry?.id || "walk"}`}>Name</label>
        <input
          id={`ob-name-${enquiry?.id || "walk"}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label htmlFor={`ob-mail-${enquiry?.id || "walk"}`}>Mailbox</label>
        <input
          id={`ob-mail-${enquiry?.id || "walk"}`}
          type="email"
          value={mailbox}
          onChange={(e) => setMailbox(e.target.value)}
          required
        />
        <label htmlFor={`ob-phone-${enquiry?.id || "walk"}`}>Phone</label>
        <input
          id={`ob-phone-${enquiry?.id || "walk"}`}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <label htmlFor={`ob-notes-${enquiry?.id || "walk"}`}>What they asked</label>
        <textarea
          id={`ob-notes-${enquiry?.id || "walk"}`}
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {enquiry ? (
          <button type="submit" disabled={Boolean(pending)}>
            {pending === "save" ? "…" : "Save details"}
          </button>
        ) : null}
      </form>
      <form className="onboard" onSubmit={makeLogin}>
        <label className="check">
          <input
            type="checkbox"
            checked={usePersonal}
            onChange={(e) => setUsePersonal(e.target.checked)}
          />
          Use their mailbox as the login
        </label>
        <p className="body bill-note">Login will be {previewLogin}.</p>
        {plots.length ? (
          <fieldset>
            <legend>Bind a site</legend>
            {plots.map((p) => (
              <label key={p.slug} className="check">
                <input
                  type="checkbox"
                  checked={picked.includes(p.slug)}
                  onChange={(e) =>
                    setPicked((rows) =>
                      e.target.checked
                        ? [...rows, p.slug]
                        : rows.filter((s) => s !== p.slug),
                    )
                  }
                />
                {p.name}
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="body">No client plots yet — they can still go on the book.</p>
        )}
        <button type="submit" disabled={Boolean(pending)}>
          {pending === "login" ? "…" : "Make their login"}
        </button>
      </form>
      {lab ? (
        <form
          className="onboard"
          onSubmit={(e) => {
            e.preventDefault();
            void makeHouse();
          }}
        >
          <label htmlFor={`ob-house-${enquiry?.id || "walk"}`}>New house on disk</label>
          <input
            id={`ob-house-${enquiry?.id || "walk"}`}
            value={houseName}
            onChange={(e) => setHouseName(e.target.value)}
            placeholder="Folder name"
          />
          <button type="submit" disabled={Boolean(pending) || !(houseName || name)}>
            {pending === "house" ? "…" : "Make the folder"}
          </button>
          <p className="body bill-note">
            Makes the filesystem. Open that folder in Cursor yourselves.
          </p>
        </form>
      ) : null}
      {enquiry ? <CloseEnquiry id={enquiry.id} /> : null}
      {error ? <p className="err">{error}</p> : null}
      {cred ? (
        <div className="cred-card">
          {cred.puppet ? (
            <p className="body">
              Offline puppet already on the book. Sign in on campus /
              localhost with the existing password (gitignored sheet). Do not
              mail or invent a new login.
            </p>
          ) : cred.email ? (
            <>
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
            </>
          ) : null}
          {cred.housePath ? (
            <p className="body">
              Folder ready at <code>{cred.housePath}</code>. Open it in Cursor —
              this desk cannot start that chat.
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
