"use client";

import { useState } from "react";

export function CopyBlock({
  label,
  text,
  children,
}: {
  label?: string;
  text: string;
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
      window.setTimeout(() => setState("idle"), 1600);
    } catch {
      setState("err");
      window.setTimeout(() => setState("idle"), 1600);
    }
  }

  return (
    <div className="epk-copy">
      <div className="epk-copy__bar">
        {label ? <span className="epk-copy__label">{label}</span> : <span />}
        <button type="button" className="epk-copy__btn" onClick={copy}>
          {state === "ok" ? "Copied" : state === "err" ? "Failed" : "Copy"}
        </button>
      </div>
      <div className="epk-copy__body">{children || <p>{text}</p>}</div>
    </div>
  );
}
