"use client";

import {
  PointerEvent,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { facultyGlyph } from "@/data/faculties";
import {
  APES_COMPASS,
  BOARD_ROOMS,
  BRIEFING_NOTES,
  CUSTOMER_SEATS,
  IDENTITY_BITS,
  LANDSCAPE_TOKENS,
  PROCESS_STEPS,
} from "@/data/board-map";
import { SCALE_FLAG_READ } from "@/data/campus";
import { plotBitSheet } from "@/data/board-sheets";
import { withPlot } from "@/data/board-live";
import {
  spaceHeld,
  spaceHero,
  spaceHost,
  spaceSeatName,
  spaceSnip,
  type BoardSpaceFill,
} from "@/lib/board-space";
import { avenueEnterHref, boardEnterHref, enterKeyFromHref } from "@/lib/board-enter";
import { BoardAssetsStrip } from "@/components/BoardAssetsStrip";

function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Snip({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <span className="board-snip" aria-hidden="true">
      {text}
    </span>
  );
}

export function BoardSpace({
  fill,
  plots = [],
  enterKey = null,
  enterRegion: _enterRegion = null,
  children,
}: {
  fill: BoardSpaceFill | null;
  plots?: { slug: string; name: string }[];
  enterKey?: string | null;
  enterRegion?: string | null;
  children?: ReactNode;
}) {
  const router = useRouter();
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(14);
  const [zoom, setZoom] = useState(0.82);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [origin, setOrigin] = useState({ x: 50, y: 58 });
  const [entering, setEntering] = useState<string | null>(null);
  const [compact, setCompact] = useState(false);
  const drag = useRef<{
    x: number;
    y: number;
    yaw: number;
    pitch: number;
    panX: number;
    panY: number;
    pan: boolean;
  } | null>(null);
  const ignoreClick = useRef(false);
  const enterTimer = useRef<number>(0);
  const zoomRef = useRef(0.82);
  const spaceDown = useRef(false);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const insideRef = useRef(false);
  const plotRef = useRef(fill?.plot);
  const enterPlateRef = useRef<(href: string) => void>(() => {});
  const compactRef = useRef(false);
  const wasCompact = useRef(false);
  zoomRef.current = zoom;
  plotRef.current = fill?.plot;
  compactRef.current = compact;

  function yawLimit(small: boolean) {
    return small ? 22 : 52;
  }
  function pitchRange(small: boolean): [number, number] {
    return small ? [6, 22] : [-8, 32];
  }
  function panLimitX(small: boolean) {
    return small ? 80 : 220;
  }
  function panLimitY(small: boolean) {
    return small ? 720 : 220;
  }
  function clampPan(small: boolean, next: { x: number; y: number }) {
    const mx = panLimitX(small);
    const my = panLimitY(small);
    return {
      x: Math.max(-mx, Math.min(mx, next.x)),
      y: Math.max(-my, Math.min(my, next.y)),
    };
  }

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    function apply() {
      const small = mq.matches;
      setCompact(small);
      compactRef.current = small;
      const [lo, hi] = pitchRange(small);
      const y = yawLimit(small);
      if (small && !wasCompact.current) {
        wasCompact.current = true;
        setYaw(0);
        setPitch(10);
        setOrigin({ x: 50, y: 22 });
        if (!insideRef.current) setZoom(0.62);
        setPan({ x: 0, y: -200 });
        return;
      }
      if (!small && wasCompact.current) {
        wasCompact.current = false;
        setPitch(14);
        setOrigin({ x: 50, y: 58 });
      }
      setYaw((v) => Math.max(-y, Math.min(y, v)));
      setPitch((v) => Math.max(lo, Math.min(hi, v)));
      setPan((v) => clampPan(small, v));
    }
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.code !== "Space") return;
      spaceDown.current = e.type === "keydown";
      const t = e.target as HTMLElement | null;
      if (t && t.closest("input,textarea,select,[contenteditable]")) return;
      e.preventDefault();
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.clearTimeout(enterTimer.current);
    };
  }, []);

  useEffect(() => {
    setEntering(null);
    if (!enterKey) {
      const small = compactRef.current;
      setZoom(small ? 0.62 : 0.82);
      setPan(small ? { x: 0, y: -200 } : { x: 0, y: 0 });
      if (small) setOrigin({ x: 50, y: 22 });
    }
  }, [enterKey]);

  const snippets = fill?.snippets || {};
  const plot = fill?.plot;
  const hero = spaceHero(snippets);
  const host = spaceHost(fill?.hostUrl);
  const processTop = [...PROCESS_STEPS].reverse();
  const inside = Boolean(enterKey && children);
  insideRef.current = inside;
  const tableEntering = Boolean(entering && !inside);
  const scaleFlag = fill?.scale || "";

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    function onWheelNative(e: globalThis.WheelEvent) {
      const well = (e.target as HTMLElement).closest(".board-inside-well") as HTMLElement | null;
      if (well) {
        const canDown = well.scrollTop + well.clientHeight < well.scrollHeight - 2;
        const canUp = well.scrollTop > 2;
        if ((e.deltaY > 0 && !canDown) || (e.deltaY < 0 && !canUp)) {
          e.preventDefault();
        }
        e.stopPropagation();
        return;
      }
      e.preventDefault();
      const small = compactRef.current;
      if (small && !insideRef.current && !e.ctrlKey && !e.metaKey) {
        setPan((v) => clampPan(true, { x: v.x - e.deltaX, y: v.y - e.deltaY }));
        return;
      }
      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) {
        setOrigin({
          x: Math.min(92, Math.max(8, ((e.clientX - rect.left) / rect.width) * 100)),
          y: Math.min(92, Math.max(8, ((e.clientY - rect.top) / rect.height) * 100)),
        });
      }
      const dir = e.deltaY > 0 ? -1 : 1;
      const next = Math.min(2.55, Math.max(0.34, zoomRef.current + dir * 0.08));
      setZoom(next);
      if (insideRef.current && dir < 0 && next < 0.7) {
        router.push(boardEnterHref("", plotRef.current));
        return;
      }
      if (insideRef.current || reducedMotion()) return;
      if (dir > 0 && next >= 1.92) {
        const node = document.elementFromPoint(e.clientX, e.clientY);
        const plate = node?.closest("[data-enter]") as HTMLElement | null;
        const href = plate?.getAttribute("href") || "";
        if (href) enterPlateRef.current(href);
      }
    }
    el.addEventListener("wheel", onWheelNative, { passive: false });
    return () => el.removeEventListener("wheel", onWheelNative);
  }, [router]);

  function door(href: string): string {
    return withPlot(href, plot);
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest(".board-inside-well,a,button,input,textarea,select,summary,label")) {
      return;
    }
    e.preventDefault();
    (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
    ignoreClick.current = false;
    const small = compactRef.current;
    const orbit = e.altKey || e.shiftKey || e.button === 1 || spaceDown.current;
    drag.current = {
      x: e.clientX,
      y: e.clientY,
      yaw,
      pitch,
      panX: pan.x,
      panY: pan.y,
      pan: small ? !orbit : orbit,
    };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    const dy = e.clientY - drag.current.y;
    if (Math.abs(dx) > 8 || Math.abs(dy) > 8) ignoreClick.current = true;
    const small = compactRef.current;
    if (drag.current.pan) {
      setPan(clampPan(small, { x: drag.current.panX + dx, y: drag.current.panY + dy }));
      return;
    }
    const y = yawLimit(small);
    const [lo, hi] = pitchRange(small);
    setYaw(Math.max(-y, Math.min(y, drag.current.yaw + dx * 0.28)));
    setPitch(Math.max(lo, Math.min(hi, drag.current.pitch - dy * 0.22)));
  }

  function onPointerUp() {
    drag.current = null;
  }

  function enterPlate(href: string) {
    const key = enterKeyFromHref(href);
    if (!key || key === enterKey) return;
    setEntering(key);
    const wait = reducedMotion() ? 90 : 280;
    enterTimer.current = window.setTimeout(() => {
      router.push(boardEnterHref(key, plot));
    }, wait);
  }
  enterPlateRef.current = enterPlate;

  function onGo(e: MouseEvent<HTMLAnchorElement>) {
    if (ignoreClick.current || entering) {
      e.preventDefault();
      return;
    }
    const href = e.currentTarget.getAttribute("href") || "";
    const key = enterKeyFromHref(href);
    if (!key) {
      if (href.startsWith("/board")) {
        e.preventDefault();
        router.push(href);
      }
      return;
    }
    e.preventDefault();
    enterPlate(href);
  }

  function zoneClass(region: string, skin: string): string {
    return `board-zone ${skin}`;
  }

  function Plate({
    href,
    className,
    held,
    snip,
    children,
  }: {
    href: string;
    className?: string;
    held?: boolean;
    snip?: string;
    children: ReactNode;
  }) {
    const key = enterKeyFromHref(href);
    const focus = Boolean(key && (entering === key || (!inside && enterKey === key)));
    return (
      <Link
        href={door(href)}
        className={`${className || ""} ${held ? "is-held" : "is-empty"}${focus ? " is-focus" : ""}`.trim()}
        data-enter={key || undefined}
        onClick={onGo}
      >
        {children}
        <Snip text={snip} />
      </Link>
    );
  }

  return (
    <div className={`board-space${inside ? " is-inside" : ""}${compact ? " is-compact" : ""}`}>
      <div className="board-hud">
        {plots.length > 1 ? (
          <div className="fw-scales" role="group" aria-label="Plot on the table">
            {plots.map((p) => (
              <Link
                key={p.slug}
                href={`/board?plot=${encodeURIComponent(p.slug)}`}
                className={fill?.plot === p.slug ? "is-on" : undefined}
              >
                {p.name}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
      <div
        ref={stageRef}
        className="board-stage"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="application"
        aria-label="MAP board. Drag to move the table. Click a place to enter."
      >
        <div
          className="board-world"
          style={
            {
              "--yaw": `${yaw}deg`,
              "--pitch": `${pitch}deg`,
              "--zoom": String(zoom),
              "--pan-x": `${pan.x}px`,
              "--pan-y": `${pan.y}px`,
              "--ox": `${origin.x}%`,
              "--oy": `${origin.y}%`,
            } as CSSProperties
          }
        >
          <div className="board-floor" aria-hidden />
          <div className={`board-table${tableEntering ? " is-entering" : ""}`}>
            <section className={zoneClass("landscape", "is-landscape")} data-region="landscape">
              <p className="board-zone-kicker">Landscape</p>
              <div className="board-landscape-row">
                {LANDSCAPE_TOKENS.map((t) => (
                  <Plate
                    key={t.id}
                    href={t.href}
                    className="board-token chamfer"
                    held={spaceHeld(snippets, `mapping:${t.id}`)}
                    snip={spaceSnip(snippets, `mapping:${t.id}`)}
                  >
                    <span className="board-mark is-dot" aria-hidden />
                    <span>
                      <strong>{t.label}</strong>
                      <em>{t.lede}</em>
                    </span>
                  </Plate>
                ))}
                <Plate
                  href="/board/mapping/evidence"
                  className="board-token chamfer"
                  held={spaceHeld(snippets, "mapping:evidence")}
                  snip={spaceSnip(snippets, "mapping:evidence")}
                >
                  <strong>Evidence</strong>
                  <em>Before a line is drawn</em>
                </Plate>
                <Plate
                  href="/board/mapping/relations"
                  className="board-token chamfer"
                  held={spaceHeld(snippets, "mapping:relations")}
                  snip={spaceSnip(snippets, "mapping:relations")}
                >
                  <strong>Relationships</strong>
                  <em>Who touches whom</em>
                </Plate>
                <Plate
                  href="/board/mapping/scale"
                  className="board-token chamfer"
                  held={spaceHeld(snippets, "mapping:scale")}
                  snip={spaceSnip(snippets, "mapping:scale")}
                >
                  <strong>Scale of the business</strong>
                  <em>A flag on the plot, set early</em>
                </Plate>
              </div>
            </section>

            <aside className={zoneClass("brief", "is-brief")} data-region="brief">
              <p className="board-zone-kicker">Briefing notes</p>
              <ol>
                {BRIEFING_NOTES.map((n) => {
                  const key =
                    n.n === "1"
                      ? "process:stage-1"
                      : n.n === "3"
                        ? "workbench:board"
                        : n.n === "4"
                          ? "workbench:host"
                          : n.n === "5"
                            ? "process:stage-8"
                            : "";
                  const held =
                    n.n === "2"
                      ? PROCESS_STEPS.some((s) => spaceHeld(snippets, `process:${s.id}`))
                      : key
                        ? spaceHeld(snippets, key)
                        : false;
                  return (
                    <li key={n.n}>
                      <Plate href={n.href} className="board-brief-note" held={held} snip={key ? spaceSnip(snippets, key) : undefined}>
                        <span>{n.n}.</span>
                        {n.label}
                      </Plate>
                    </li>
                  );
                })}
              </ol>
            </aside>

            <section className={zoneClass("identity", "is-identity")} data-region="identity">
              <Link href={door("/board/plot/identity")} className="board-zone-kicker board-zone-link" onClick={onGo}>
                Identity
              </Link>
              <Plate
                href="/board/identity/principles"
                className="board-bit-link"
                held={
                  spaceHeld(snippets, "identity:principles") ||
                  spaceHeld(snippets, "identity:ethics") ||
                  spaceHeld(snippets, "identity:toolkit") ||
                  spaceHeld(snippets, "identity:systems")
                }
                snip="Principles, ethics, toolkit, systems — our protocol, not their bits"
              >
                <strong>Identity systems</strong>
                <em>Tools to print or buy. A flyer cannot invent a second identity.</em>
              </Plate>
              <ul className="board-bits">
                {IDENTITY_BITS.map((b) => (
                  <li key={b.id}>
                    <Plate
                      href={b.href}
                      className="board-bit-link"
                      held={spaceHeld(snippets, `plot:${b.id}`)}
                      snip={spaceSnip(snippets, `plot:${b.id}`) || plotBitSheet(b.id)?.lede}
                    >
                      <strong>{b.label}</strong>
                      <em>{spaceSnip(snippets, `plot:${b.id}`) || plotBitSheet(b.id)?.lede}</em>
                    </Plate>
                  </li>
                ))}
              </ul>
            </section>

            <section className={zoneClass("object", "is-object")} data-region="object">
              <Link
                href={door("/board/plot")}
                className={`board-object chamfer ${hero ? "is-held" : "is-empty"}${entering === "plot" || enterKey === "plot" ? " is-focus" : ""}`}
                data-enter="plot"
                onClick={onGo}
              >
                <span className="kicker">00</span>
                <strong>{fill?.plotName || "The thing itself"}</strong>
                {host ? <span className="board-object-host">{host}</span> : null}
                <span className={`board-object-hero${hero ? " is-line" : ""}`}>
                  {hero ||
                    (fill
                      ? `${fill.plotName} has not written the thing itself yet.`
                      : "Vacant until a plot is on the book.")}
                </span>
                <span className="board-object-token" aria-hidden />
              </Link>
              <BoardAssetsStrip plot={plot} />
            </section>

            <section className={zoneClass("senses", "is-senses")} data-region="senses">
              <div className="board-object-senses">
                <Plate
                  href="/board/comms/message"
                  className="board-tile chamfer"
                  held={spaceHeld(snippets, "comms:message")}
                  snip={spaceSnip(snippets, "comms:message")}
                >
                  <span className="board-mark is-clover is-lg" aria-hidden />
                  <span>
                    <strong>Narrative</strong>
                    <em>{spaceSnip(snippets, "comms:message") || "The one line"}</em>
                  </span>
                </Plate>
                <Plate
                  href="/board/comms/channel"
                  className="board-tile chamfer"
                  held={spaceHeld(snippets, "comms:channel")}
                  snip={spaceSnip(snippets, "comms:channel")}
                >
                  <span className="board-mark is-cross is-lg is-ink" aria-hidden />
                  <span>
                    <strong>Sensory</strong>
                    <em>{spaceSnip(snippets, "comms:channel") || "Where the line has to live"}</em>
                  </span>
                </Plate>
                <Link
                  href={door("/board/apes")}
                  className="board-tile is-apes chamfer"
                  data-enter="apes:analytical"
                  onClick={onGo}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={facultyGlyph("apes")} alt="" />
                  <span>A.P.E.S.</span>
                </Link>
                <div className="board-apes-letters">
                  {APES_COMPASS.map((a) => (
                    <Plate
                      key={a.letter}
                      href={a.href}
                      className="board-letter chamfer"
                      held={spaceHeld(snippets, `apes:${a.name.toLowerCase()}`)}
                      snip={a.name}
                    >
                      {a.letter}
                    </Plate>
                  ))}
                </div>
              </div>
            </section>

            <section className={zoneClass("process", "is-process")} data-region="process">
              <ol>
                {processTop.map((s) => {
                  const radHole = s.id === "stage-3" && !spaceHeld(snippets, "mapping:evidence");
                  const snip =
                    spaceSnip(snippets, `process:${s.id}`) ||
                    (radHole
                      ? "Evidence is empty. RAD stays a hole."
                      : s.id === "stage-4"
                        ? "A range, not one direction"
                        : s.id === "stage-5"
                          ? "One direction from that range"
                          : s.name);
                  return (
                    <li key={s.id}>
                      <Plate
                        href={s.href}
                        className={`chamfer is-stage-${s.n}${radHole ? " is-hole" : ""}`}
                        held={spaceHeld(snippets, `process:${s.id}`)}
                        snip={snip}
                      >
                        <span className="kicker">{s.n}</span>
                        <strong>{s.short}</strong>
                        <em>{snip}</em>
                      </Plate>
                    </li>
                  );
                })}
              </ol>
            </section>

            <section className={zoneClass("customers", "is-customers")} data-region="customers">
              <Link
                href={door("/board/mapping/audience")}
                className="board-zone-kicker board-zone-link"
                data-enter="mapping:audience"
                onClick={onGo}
              >
                Customers
              </Link>
              <ol>
                {CUSTOMER_SEATS.map((c) => {
                  const name = spaceSeatName(snippets, c.n);
                  const snip = spaceSnip(snippets, `mapping:audience:${c.n}`);
                  const held = Boolean(name) || spaceHeld(snippets, `mapping:audience:${c.n}`);
                  return (
                    <li key={c.n}>
                      <Plate
                        href={c.href}
                        className={`board-customer chamfer${held ? "" : " is-vacant"}`}
                        held={held}
                        snip={snip || (held ? "" : "Vacant on purpose")}
                      >
                        <span className="board-customer-n">{c.n}</span>
                        <span className="board-mark is-person is-ink" aria-hidden />
                        <span className="board-customer-who">{name || `Seat ${c.n}`}</span>
                      </Plate>
                    </li>
                  );
                })}
              </ol>
              <aside className="board-customer-meta">
                <p>
                  <strong>Who came through</strong>
                  Clock later. This host does not invent a count.
                </p>
                <p>
                  <strong>From who you are</strong>
                  {scaleFlag ? SCALE_FLAG_READ[scaleFlag] : "Scale is a flag on the plot. Set it early on the scale plate."}
                </p>
              </aside>
            </section>
          </div>
        </div>
        {inside ? <div className="board-inside-well">{children}</div> : null}
      </div>
      <ol className="board-legend">
        <li className="board-legend-key">
          <Link href={door("/board/mapping/advocates")} className="is-topic" onClick={onGo}>
            Landscape
          </Link>
          <Link href={door("/board/identity/principles")} className="is-avenue" onClick={onGo}>
            Identity
          </Link>
          <Link href={door("/board/process/stage-1")} className="is-action" onClick={onGo}>
            Process
          </Link>
          <Link href={boardEnterHref("plot", plot)} className="is-plot" onClick={onGo}>
            Object
          </Link>
        </li>
        {BOARD_ROOMS.map((room) => (
          <li key={room.id}>
            <Link href={avenueEnterHref(room.id, plot)} onClick={onGo}>
              <span>{room.n}</span>
              {room.name}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
