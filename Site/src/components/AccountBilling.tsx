"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function CloseEnquiry({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClose() {
    setPending(true);
    await fetch("/api/enquiries/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button type="button" className="act-quiet" onClick={onClose} disabled={pending}>
      {pending ? "…" : "Done"}
    </button>
  );
}

export function PrintButton() {
  return (
    <button type="button" className="act act-line" onClick={() => window.print()}>
      Print
    </button>
  );
}

export function PayButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onPay() {
    setError("");
    setPending(true);
    const res = await fetch("/api/billing/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Payment didn’t record.");
      return;
    }
    router.refresh();
  }

  return (
    <span className="pay-cell">
      <button type="button" onClick={onPay} disabled={pending}>
        {pending ? "…" : "Pay"}
      </button>
      {error ? <span className="err">{error}</span> : null}
    </span>
  );
}

export function VoidButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onVoid() {
    setPending(true);
    const res = await fetch("/api/billing/void", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoiceId }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <button type="button" className="act-quiet" onClick={onVoid} disabled={pending}>
      {pending ? "…" : "Void"}
    </button>
  );
}

export function IssueButton({ invoiceId }: { invoiceId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onIssue() {
    setPending(true);
    const res = await fetch("/api/billing/issue", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: invoiceId }),
    });
    setPending(false);
    if (res.ok) router.refresh();
  }

  return (
    <button type="button" onClick={onIssue} disabled={pending}>
      {pending ? "…" : "Issue"}
    </button>
  );
}

export function ProfileForm({
  displayName,
  userId,
  hasAvatar,
}: {
  displayName: string;
  userId: string;
  hasAvatar: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(displayName);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onName(e: FormEvent) {
    e.preventDefault();
    setError("");
    setPending(true);
    const res = await fetch("/api/account/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name }),
    });
    setPending(false);
    if (!res.ok) {
      setError("Name didn’t save.");
      return;
    }
    router.refresh();
  }

  async function onPhoto(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const file = new FormData(e.currentTarget).get("file");
    if (!(file instanceof File) || !file.size) return;
    setPending(true);
    const data = new FormData();
    data.set("file", file);
    const res = await fetch("/api/account/avatar", { method: "POST", body: data });
    setPending(false);
    if (!res.ok) {
      setError("Picture didn’t take. JPEG, PNG or WebP, under 2MB.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="profile-card">
      {hasAvatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="avatar" src={`/api/account/avatar/${userId}`} alt="" />
      ) : (
        <div className="avatar avatar-empty" aria-hidden />
      )}
      <div>
        <form onSubmit={onName}>
          <label htmlFor="displayName">Name</label>
          <input
            id="displayName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit" disabled={pending}>
            {pending ? "…" : "Save"}
          </button>
        </form>
        <form className="photo-form" onSubmit={onPhoto}>
          <label htmlFor="photo">Picture</label>
          <input id="photo" name="file" type="file" accept="image/jpeg,image/png,image/webp" />
          <button type="submit" disabled={pending}>
            Upload
          </button>
        </form>
        {error ? <p className="err">{error}</p> : null}
      </div>
    </div>
  );
}
