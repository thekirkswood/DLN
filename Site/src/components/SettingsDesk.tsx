"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StudioSettings } from "@/lib/settings";
import type { CatalogueItem } from "@/data/catalogue";
import { CataloguePrices, PayRailForm, OnlineRailForm } from "@/components/InvoiceDesk";
import type { PayRail, OnlineRail } from "@/lib/billing";

export function SettingsDesk({
  settings,
  catalogue,
  rail,
  online,
}: {
  settings: StudioSettings;
  catalogue: CatalogueItem[];
  rail: PayRail;
  online: OnlineRail;
}) {
  const router = useRouter();
  const [graceDays, setGraceDays] = useState(String(settings.graceDays));
  const [adobeKit, setAdobeKit] = useState(settings.adobeKit);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    setGraceDays(String(settings.graceDays));
    setAdobeKit(settings.adobeKit);
  }, [settings]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setOk("");
    const days = Number(graceDays);
    if (!Number.isInteger(days) || days < 1 || days > 90) {
      setError("Days to pay has to be between 1 and 90.");
      return;
    }
    setPending(true);
    const res = await fetch("/api/studio/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graceDays: days,
        adobeKit,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Settings didn’t save.");
      return;
    }
    setOk("Settings saved.");
    router.refresh();
  }

  return (
    <div className="settings-desk">
      <p className="body bill-note">
        Defaults for each entry. Empty is £0. Days to pay is the invoice. The
        kit id is Dave’s Adobe Fonts web project. Online pay is the system they
        enter their details into. Bank sits here as a spare rail — Pay pings
        online, it does not ask us to type an invoice by hand.
      </p>
      <h2>Standing amounts</h2>
      <CataloguePrices catalogue={catalogue} mode="defaults" />
      <form className="onboard" onSubmit={onSubmit}>
        <label htmlFor="set-grace">Days to pay</label>
        <input
          id="set-grace"
          inputMode="numeric"
          value={graceDays}
          onChange={(e) => {
            const raw = e.target.value;
            if (!/^\d*$/.test(raw)) return;
            setGraceDays(raw);
          }}
        />
        <label htmlFor="set-kit">Adobe Fonts kit</label>
        <input
          id="set-kit"
          value={adobeKit}
          onChange={(e) => setAdobeKit(e.target.value.trim())}
          autoComplete="off"
          spellCheck={false}
          placeholder="kit id"
        />
        <button type="submit" disabled={pending}>
          {pending ? "…" : "Save settings"}
        </button>
        {error ? <p className="err">{error}</p> : null}
        {ok ? <p className="note">{ok}</p> : null}
      </form>
      <h2>Online pay</h2>
      <OnlineRailForm rail={online} />
      <h2>Bank (spare)</h2>
      <PayRailForm rail={rail} />
    </div>
  );
}
