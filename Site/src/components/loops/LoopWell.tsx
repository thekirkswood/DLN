"use client";

import { useEffect, useRef } from "react";

type LoopWellProps = {
  src: string;
  className: string;
  freezeBeat?: string;
};

function scopeCss(css: string) {
  return css
    .replace(/:root\b/g, ":host")
    .replace(/html,\s*body/g, ":host")
    .replace(/\bhtml\[/g, ":host[")
    .replace(/\bbody\s*\{/g, ":host {")
    .replace(/\bhtml\s*\{/g, ":host {")
    .replace(/100vw/g, "100cqw")
    .replace(/100vh/g, "100cqh");
}

function nakedFrom(doc: Document) {
  const css = [...doc.querySelectorAll("style")]
    .map((node) => node.textContent || "")
    .join("\n");
  const scripts = [...doc.querySelectorAll("script")]
    .filter((node) => !node.src)
    .map((node) => node.textContent || "")
    .join("\n");
  const body = doc.body.cloneNode(true) as HTMLElement;
  body.querySelectorAll("script, style, link, meta, title").forEach((node) => node.remove());
  let html = body.innerHTML;
  html = html.replaceAll("../../brand/", "/brand/");
  html = html.replaceAll("../brand/", "/brand/");
  html = html.replaceAll('fill="#fff"', 'fill="var(--ground, #ffffff)"');
  return { css: scopeCss(css), html, scripts };
}

export function LoopWell({ src, className, freezeBeat }: LoopWellProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<{ host: HTMLDivElement; shadow: ShadowRoot } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    if (!boxRef.current || boxRef.current.host !== host) {
      boxRef.current = { host, shadow: host.attachShadow({ mode: "closed" }) };
    }
    const shadow = boxRef.current.shadow;

    let gone = false;
    const observers: MutationObserver[] = [];
    const frames = new Set<number>();

    const requestFrame = (cb: FrameRequestCallback) => {
      const id = window.requestAnimationFrame(cb);
      frames.add(id);
      return id;
    };
    const cancelFrame = (id: number) => {
      frames.delete(id);
      window.cancelAnimationFrame(id);
    };

    function paintGround() {
      const ink = document.documentElement.getAttribute("data-ground") === "ink";
      host.style.setProperty("--ground", ink ? "#000000" : "#ffffff");
      host.style.setProperty("--ink", ink ? "#ffffff" : "#414141");
      host.style.setProperty("--mute", ink ? "#a8a8a8" : "#6e6e6e");
      host.style.setProperty("--line", ink ? "#3a3a3a" : "#d4d4d4");
      host.style.setProperty("--bar", ink ? "#2c2c2c" : "#d8d8d8");
    }

    const groundWatch = new MutationObserver(paintGround);
    groundWatch.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-ground"],
    });
    observers.push(groundWatch);
    paintGround();

    fetch(src, { cache: "no-cache" })
      .then((res) => {
        if (!res.ok) throw new Error("loop missing");
        return res.text();
      })
      .then((text) => {
        if (gone) return;
        const parsed = new DOMParser().parseFromString(text, "text/html");
        const { css, html, scripts } = nakedFrom(parsed);
        for (const attr of [...parsed.documentElement.attributes]) {
          if (attr.name.startsWith("data-")) host.setAttribute(attr.name, attr.value);
        }

        shadow.innerHTML = "";
        const style = document.createElement("style");
        style.textContent = `:host {
  container-type: size;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: transparent;
  color: var(--ink, #414141);
}
${css}`;
        shadow.append(style);
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        shadow.append(...[...wrap.childNodes]);

        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const search =
          reduce && freezeBeat ? `?beat=${encodeURIComponent(freezeBeat)}` : "";

        const Watch = class extends MutationObserver {
          constructor(cb: MutationCallback) {
            super(cb);
            observers.push(this);
          }
        };

        const boundDoc = {
          getElementById: (id: string) => shadow.getElementById(id),
          querySelector: (sel: string) => shadow.querySelector(sel),
          querySelectorAll: (sel: string) => shadow.querySelectorAll(sel),
          documentElement: host,
          body: host,
        };

        const run = new Function(
          "root",
          "host",
          "doc",
          "loc",
          "requestAnimationFrame",
          "cancelAnimationFrame",
          "MutationObserver",
          `var document = doc; var location = loc;\n${scripts}`,
        );

        run(shadow, host, boundDoc, { search }, requestFrame, cancelFrame, Watch);
      })
      .catch(() => {
        if (!gone) shadow.innerHTML = "";
      });

    return () => {
      gone = true;
      observers.forEach((ob) => ob.disconnect());
      frames.forEach((id) => window.cancelAnimationFrame(id));
      shadow.innerHTML = "";
    };
  }, [src, freezeBeat]);

  return <div ref={hostRef} className={className} aria-hidden />;
}
