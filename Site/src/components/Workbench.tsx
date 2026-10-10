"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Mark } from "@/components/Mark";
import { EnquireForm } from "@/components/HomeOffer";
import { BrandStrip } from "@/components/WorkLine";
import { OfferWalk, type WalkDoor } from "@/components/OfferWalk";
import { SitePeek } from "@/components/SitePeek";
import { needById, type Facet } from "@/data/needs";
import {
  MERZ_RESEARCH,
  MODULES,
  needForContact,
} from "@/data/bench";
import { BOOM_STACKS, BOOMSTACK_LINE } from "@/data/boomstack";
import { catalogueById } from "@/data/catalogue";
import {
  lineById,
  linesFor,
  type LineId,
} from "@/data/worklines";
import {
  ENGINE_STAGES,
  PIPELINES,
  facultyById,
  type Faculty,
  type FacultyId,
  type PipelineId,
} from "@/data/faculties";
import { MERZ_SEAL } from "@/data/plates";
import {
  ACCESS,
  BRAND_BITS_LEFT,
  HERE_FOR,
  SCALES,
  bookMessage,
  lineForScale,
  needIdFromQualify,
  plotOpen,
  pointsForScale,
  readQualify,
  writeQualify,
  readLastPlot,
  writeLastPlot,
  type AccessId,
  type Qualify,
  type ScaleId,
} from "@/data/campus";
import { PaperInkChips, applyGround } from "@/components/GroundSwitch";
import { OnboardChat } from "@/components/OnboardChat";
import { plotShowsPressKit } from "@/data/boomstack";
import { servicePlots } from "@/lib/service-plots";

type Me = { id: string; displayName?: string; avatar?: string; role?: string };
type PlotPeek = {
  slug: string;
  name: string;
  status: string;
  party: string;
  hostUrl: string | null;
  buildUrl: string | null;
  previewUrl: string | null;
  plane?: "build" | "live";
  port?: number | null;
  enterUrl: string | null;
  sandbox: string;
  kit: string | null;
  stack: 1 | 2 | 3 | null;
  pages?: { name: string; path: string }[];
};
type Door = "design" | "strategy" | "build";
type Room = Door | "host" | "board" | FacultyId | "engine" | "supplier";
type Place = "land" | "who" | "space";

const TILES: { id: Door; n: string; name: string }[] = [
  { id: "design", n: "01", name: "Design" },
  { id: "strategy", n: "02", name: "Strategy" },
  { id: "build", n: "03", name: "Build" },
];

const GREYS_PAPER = [
  "#161616",
  "#3a3a3a",
  "#5c5c5c",
  "#7a7a7a",
  "#9a9a9a",
  "#b8b8b8",
];
const GREYS_INK = [
  "#f2f2f2",
  "#d4d4d4",
  "#b4b4b4",
  "#8e8e8e",
  "#6e6e6e",
  "#4a4a4a",
];

type Ways = Record<Door, string>;

function doorOf(room: Room | null): Door | null {
  if (!room) return null;
  if (room === "host") return null;
  if (room === "engine" || room === "supplier") return "strategy";
  if (room === "design" || room === "strategy" || room === "build") return room;
  return null;
}

export function Workbench({
  signedIn,
  displayName,
  userId,
  lab = false,
  studio = false,
  start,
}: {
  signedIn?: boolean;
  displayName?: string;
  userId?: string;
  lab?: boolean;
  studio?: boolean;
  start?: "host";
}) {
  const [place, setPlace] = useState<Place>("land");
  const [room, setRoom] = useState<Room | null>(start === "host" ? "host" : null);
  const [line, setLine] = useState<LineId | null>(null);
  const [offerAt, setOfferAt] = useState(0);
  const [mode, setMode] = useState<"change" | "plan" | "note">("change");
  const [sense, setSense] = useState<"narrative" | "sensory">("narrative");
  const [me, setMe] = useState<Me | null>(
    signedIn ? { id: userId || "session", displayName } : null,
  );
  const [plots, setPlots] = useState<PlotPeek[]>([]);
  const [lastPlot, setLastPlot] = useState<string | null>(null);
  const [enquiryId, setEnquiryId] = useState<string | null>(null);
  const [contact, setContact] = useState<Facet | "host" | null>(null);
  const [contactNeedId, setContactNeedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [noteOk, setNoteOk] = useState("");
  const [noteErr, setNoteErr] = useState("");
  const [pending, setPending] = useState(false);
  const [stageN, setStageN] = useState(0);
  const [holdStage, setHoldStage] = useState(false);
  const [railShut, setRailShut] = useState(false);
  const [pipe, setPipe] = useState<PipelineId>("websites");
  const [qualify, setQualify] = useState<Qualify | null>(null);
  const [ways, setWays] = useState<Ways>({
    design: GREYS_PAPER[0],
    strategy: GREYS_PAPER[2],
    build: GREYS_PAPER[4],
  });
  const [pull, setPull] = useState<"" | "in" | "out">("");
  const wipeT = useRef<number[]>([]);

  useEffect(() => {
    setQualify(readQualify());
    setLastPlot(readLastPlot());
    const g = document.documentElement.getAttribute("data-ground");
    if (g === "ink") {
      setWays({
        design: GREYS_INK[0],
        strategy: GREYS_INK[2],
        build: GREYS_INK[4],
      });
    }
    function onGround(e: Event) {
      const id = (e as CustomEvent<string>).detail;
      if (id === "paper" || id === "ink") paintWays(id);
    }
    window.addEventListener("dln-pick-ground", onGround);
    return () => window.removeEventListener("dln-pick-ground", onGround);
  }, []);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { credentials: "include", cache: "no-store" })
      .then(async (res) => {
        if (!alive || !res.ok) return;
        const data = (await res.json()) as {
          user?: Me | null;
          plots?: PlotPeek[];
        };
        const user = data.user || null;
        if (user) {
          setMe(user);
        } else if (!signedIn) {
          setMe(null);
        }
        const next = servicePlots(data.plots || []);
        setPlots(next);
        const stored = readLastPlot();
        const pick =
          (stored && next.find((p) => p.slug === stored)?.slug) ||
          next[0]?.slug ||
          null;
        if (pick) {
          setLastPlot(pick);
          writeLastPlot(pick);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [signedIn]);

  useEffect(() => {
    if (room !== "engine" || holdStage) return;
    const t = window.setInterval(() => {
      setStageN((n) => (n + 1) % ENGINE_STAGES.length);
    }, 3200);
    return () => window.clearInterval(t);
  }, [room, holdStage]);

  useEffect(() => {
    if (room !== "engine") setHoldStage(false);
  }, [room]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 860px)");
    function sync() {
      if (!mq.matches) setRailShut(false);
      else if (room) setRailShut(true);
    }
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [room]);

  useEffect(() => {
    if (
      room &&
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 860px)").matches
    ) {
      setRailShut(true);
    }
  }, [room]);

  const research = useMemo(() => {
    if (sense === "sensory") return MERZ_RESEARCH.filter((_, i) => i % 2 === 1);
    return MERZ_RESEARCH.filter((_, i) => i % 2 === 0);
  }, [sense]);
  const need = contactNeedId
    ? needById(contactNeedId)
    : contact
      ? needById(needForContact(contact))
      : undefined;
  const faculty = room ? facultyById(room) : undefined;
  const onCampus = !room && (place === "land" || place === "space");
  const openDoorId = doorOf(room);

  useEffect(
    () => () => wipeT.current.forEach((id) => window.clearTimeout(id)),
    [],
  );

  function withPull(fn: () => void, way: "in" | "out") {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      fn();
      return;
    }
    wipeT.current.forEach((id) => window.clearTimeout(id));
    wipeT.current = [];
    setPull(way);
    const a = window.setTimeout(
      () => {
        fn();
        setPull("");
      },
      way === "in" ? 700 : 380,
    );
    wipeT.current.push(a);
  }

  function goCampus() {
    if (typeof window !== "undefined" && window.location.pathname === "/host") {
      window.location.assign("/");
      return;
    }
    const leave = () => {
      setPlace("land");
      setRoom(null);
      setLine(null);
    };
    if (room) withPull(leave, "out");
    else leave();
  }

  function openDoor(id: Door) {
    const run = () => {
      setPlace("land");
      setRoom(id);
      setLine(null);
      setOfferAt(Date.now());
      shutPhoneRail();
    };
    if (!room) withPull(run, "in");
    else run();
  }

  function shutPhoneRail() {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 860px)").matches
    ) {
      setRailShut(true);
    }
  }

  function openLine(id: LineId) {
    if (id === "infra") {
      const run = () => {
        setPlace("land");
        setRoom("host");
        setLine(null);
      };
      if (!room) withPull(run, "in");
      else run();
      return;
    }
    if (id === "platform") {
      const run = () => {
        setPlace("land");
        setRoom("engine");
        setLine(null);
      };
      if (!room) withPull(run, "in");
      else run();
      return;
    }
    if (id === "online") {
      openLine("marketing");
      return;
    }
    const row = lineById(id);
    if (!row) return;
    const run = () => {
      setPlace("land");
      setRoom(row.facet);
      setLine(row.id);
      shutPhoneRail();
    };
    if (!room) withPull(run, "in");
    else run();
  }

  function openHost() {
    setPlace("land");
    setRoom("host");
    setLine(null);
    setOfferAt(Date.now());
    shutPhoneRail();
  }

  function openEngine() {
    setRoom("engine");
    setLine(null);
    shutPhoneRail();
  }

  function openContact(facet: Facet | "host", needId?: string) {
    setContact(facet);
    setContactNeedId(needId || null);
  }

  function scramble() {
    const ground = document.documentElement.getAttribute("data-ground");
    const pool = [...(ground === "ink" ? GREYS_INK : GREYS_PAPER)].sort(
      () => Math.random() - 0.5,
    );
    setWays({ design: pool[0], strategy: pool[1], build: pool[2] });
  }

  function paintWays(next: "paper" | "ink") {
    const pool = next === "ink" ? GREYS_INK : GREYS_PAPER;
    setWays({
      design: pool[0],
      strategy: pool[2],
      build: pool[4],
    });
  }

  const inside = Boolean(room);
  const wayStyle = inside
    ? undefined
    : {
        ["--way-design" as string]: ways.design,
        ["--way-strategy" as string]: ways.strategy,
        ["--way-build" as string]: ways.build,
      };

  function finishPlot(row: Qualify, id?: string) {
    setQualify(row);
    if (id) setEnquiryId(id);
    const next = plotOpen(row);
    if (next.kind === "login") {
      window.location.assign(me || signedIn ? next.next : `/login?next=${next.next}`);
      return;
    }
    setPlace("space");
    if (next.kind === "room") {
      if (next.room === "host") openHost();
      else if (next.room === "engine") openEngine();
      else {
        setRoom("supplier");
        setLine(null);
      }
      return;
    }
    if (next.kind === "line") openLine(next.id as LineId);
    else openDoor(next.id);
  }

  return (
    <div
      className={`bench is-${room || place}${inside ? " is-inside" : ""}${pull ? ` is-pulling-${pull}` : ""}`}
      style={wayStyle}
    >
      <header className={inside ? "bench-bar is-inside" : "bench-bar is-land"}>
        <div className="bench-brand">
          <button
            type="button"
            className="bench-mark"
            aria-label="Campus"
            onClick={goCampus}
          >
            <Mark size="nav" />
          </button>
          <PaperInkChips />
        </div>
        <div className="bench-end">
          {inside ? (
            <>
              <button
                type="button"
                className={room === "host" ? "bench-glyph is-host" : "bench-glyph"}
                aria-label="Host"
                onClick={openHost}
              >
                H
              </button>
              <span className="bench-glyph is-mute">YT</span>
            </>
          ) : null}
          {me ? (
            <a className="bench-word" href="/account">
              {me.displayName || "Account"}
            </a>
          ) : (
            <Link className="bench-login" href="/login?next=/" aria-label="Sign in">
              <span>{inside ? "Login" : "Sign in"}</span>
            </Link>
          )}
        </div>
      </header>
      <div className={inside ? `bench-body${railShut ? " is-rail-shut" : ""}` : "bench-body is-open"}>
        {inside ? (
          <aside className={railShut ? "bench-rail is-shut" : "bench-rail"} aria-label="What we do">
            <button
              type="button"
              className="bench-rail-fold"
              aria-expanded={!railShut}
              aria-label={railShut ? "Open the list" : "Close the list"}
              onClick={() => setRailShut((v) => !v)}
            >
              <span aria-hidden>{railShut ? "›" : "‹"}</span>
            </button>
            <nav className="bench-doors is-rail" aria-label="Rooms">
              {TILES.map((d) => {
                const open = openDoorId === d.id;
                const mod = MODULES.find((m) => m.id === d.id);
                return (
                  <div
                    key={d.id}
                    className={open ? "bench-door is-open" : "bench-door"}
                  >
                    <button
                      type="button"
                      className={open ? "bench-door-head is-on" : "bench-door-head"}
                      aria-expanded={open}
                      onClick={() => openDoor(d.id)}
                    >
                      {d.name}
                    </button>
                    {open && mod ? (
                      <ul className="bench-lines">
                        {mod.id === "strategy" ? (
                          <li>
                            <button
                              type="button"
                              className={
                                room === "engine" ? "is-on" : undefined
                              }
                              onClick={openEngine}
                            >
                              How we work
                            </button>
                          </li>
                        ) : null}
                        <li className="is-contact">
                          <button
                            type="button"
                            className="bench-line-form"
                            onClick={() => openContact(mod.id)}
                          >
                            {mod.contact}
                          </button>
                        </li>
                      </ul>
                    ) : null}
                  </div>
                );
              })}
              <div className={room === "host" ? "bench-door is-open" : "bench-door"}>
                <button
                  type="button"
                  className={
                    room === "host" ? "bench-door-head is-on" : "bench-door-head"
                  }
                  onClick={openHost}
                >
                  BoomStack
                </button>
              </div>
            </nav>
          </aside>
        ) : null}
        <div className={`bench-stage is-${room || place}`}>
          {place === "who" && !room ? (
            <PlotWho lab={lab} onDone={finishPlot} onCancel={goCampus} />
          ) : null}
          {onCampus && place === "land" ? (
            <Land
              onOpen={openDoor}
              onLine={openLine}
              onPlot={() => setPlace("who")}
              onScramble={scramble}
              ways={ways}
              plots={me ? plots : []}
              lab={lab}
              showBoard={lab && studio}
              onPickPlot={(slug) => {
                setLastPlot(slug);
                writeLastPlot(slug);
              }}
              me={Boolean(me)}
            />
          ) : null}
          {onCampus && place === "space" && qualify ? (
            <OwnSpace
              qualify={qualify}
              onOpen={openDoor}
              onHow={openEngine}
              enquiryId={enquiryId}
            />
          ) : null}
          {room === "design" ||
          room === "strategy" ||
          room === "build" ||
          room === "host" ? (
            <OfferWalk
              door={room === "host" ? "host" : room}
              at={offerAt}
              focusId={line}
              onSeen={(id: WalkDoor) => setRoom(id)}
              onContact={(needId) =>
                openContact(room === "host" ? "host" : room, needId)
              }
              onHost={openHost}
              onEngine={openEngine}
              host={
                <div
                  id="offer-host"
                  data-offer-door="host"
                  className="bench-offer-door"
                >
                  <HostRoom
                    lab={lab}
                    onContact={(needId) => openContact("host", needId)}
                  />
                </div>
              }
            />
          ) : null}
          {room === "board" && lab && studio ? (
            <BoardRoom
              signedIn={Boolean(me) || Boolean(signedIn)}
              mode={mode}
              setMode={setMode}
              sense={sense}
              setSense={setSense}
              research={research}
              note={note}
              setNote={setNote}
              noteOk={noteOk}
              noteErr={noteErr}
              pending={pending}
              onNote={async (e: FormEvent) => {
                e.preventDefault();
                setNoteErr("");
                setNoteOk("");
                setPending(true);
                const res = await fetch("/api/board/feedback", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ text: note }),
                });
                setPending(false);
                if (!res.ok) {
                  setNoteErr(
                    "The live board needs a signed-in site. Write it here and we still take the note, or open Board from your account.",
                  );
                  return;
                }
                setNote("");
                setNoteOk("On the board.");
              }}
            />
          ) : null}
          {faculty ? (
            <FacultyRoom
              faculty={faculty}
              onSolport={() => openDoor("strategy")}
              onEngine={openEngine}
            />
          ) : null}
          {room === "engine" ? (
            <EngineRoom
              stageN={stageN}
              setStageN={(n) => {
                setHoldStage(true);
                setStageN(n);
              }}
              pipe={pipe}
              setPipe={setPipe}
            />
          ) : null}
          {room === "supplier" ? <SupplierRoom /> : null}
        </div>
      </div>
      {contact ? (
        <div className="bench-sheet">
          <div className="bench-sheet-panel">
            <p className="bench-kicker">Contact</p>
            <EnquireForm
              need={contactNeedId ? need : undefined}
              facet={contact === "host" ? "build" : contact || undefined}
              open
              lab={lab}
              onClear={() => {
                setContact(null);
                setContactNeedId(null);
              }}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Land({
  onOpen,
  onLine: _onLine,
  onPlot,
  onScramble,
  ways,
  plots,
  lab = false,
  showBoard,
  onPickPlot,
  me = false,
}: {
  onOpen: (id: Door) => void;
  onLine: (_id: LineId) => void;
  onPlot: () => void;
  onScramble: () => void;
  ways: Ways;
  plots: PlotPeek[];
  lab?: boolean;
  showBoard?: boolean;
  onPickPlot: (slug: string) => void;
  me?: boolean;
}) {
  const [tab, setTab] = useState<"campus" | string>("campus");

  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("site");
    if (!want) return;
    if (plots.some((p) => p.slug === want)) {
      setTab(want);
      onPickPlot(want);
    }
  }, [plots, onPickPlot]);

  const site =
    tab !== "campus" ? plots.find((p) => p.slug === tab) || null : null;
  const door =
    site?.previewUrl || (lab ? site?.buildUrl : site?.hostUrl) || null;

  function openSite(slug: string) {
    setTab(slug);
    onPickPlot(slug);
  }

  return (
    <div className="campus-ticket-wrap">
      <div className="campus-ticket-tabs">
        <button
          type="button"
          className={tab === "campus" ? "campus-tab is-on" : "campus-tab"}
          onClick={() => setTab("campus")}
        >
          Campus
        </button>
        {plots.filter((p) => p.slug !== "various-titles").map((p) => (
          <button
            key={p.slug}
            type="button"
            className={tab === p.slug ? "campus-tab is-on" : "campus-tab"}
            onClick={() => openSite(p.slug)}
          >
            {p.name}
          </button>
        ))}
        {!me ? (
          <button type="button" className="campus-tab campus-add-brand" onClick={onPlot}>
            <span>+</span>
            Add a brand
          </button>
        ) : null}
      </div>
      <div className="campus-ticket">
        {tab === "campus" ? (
          <>
            <h1 className="campus-sentence">
              We <i>build</i>, <i>scale</i>, and <i>secure</i> <i>resilient</i>{" "}
              brand <i>identity</i> <i>presences</i> on <i>screen</i> and in{" "}
              <i>print</i>.
            </h1>
            <div className="campus-cols">
              {TILES.map((tile) => (
                  <div
                    key={tile.id}
                    className={`campus-col is-${tile.id}`}
                    style={{ ["--tile" as string]: ways[tile.id] }}
                  >
                    <div className="campus-col-head">
                      <button
                        type="button"
                        className="campus-n"
                        aria-label={`Shuffle ${tile.name} greys`}
                        onClick={onScramble}
                      >
                        {tile.n}
                      </button>
                      <h2>
                        <button type="button" onClick={() => onOpen(tile.id)}>
                          {tile.name}
                        </button>
                      </h2>
                    </div>
                  </div>
              ))}
            </div>
          </>
        ) : null}
        {site ? (
          <>
            <SitePeek
              name={site.name}
              slug={site.slug}
              live={site.enterUrl || site.hostUrl}
              sandbox={door}
              lab={lab}
              pages={site.pages || []}
              src={door || site.enterUrl || site.hostUrl || ""}
              kit={plotShowsPressKit(site.stack, site.kit) ? site.kit : null}
              showPress={plotShowsPressKit(site.stack, site.kit)}
              signedIn={me}
            />
            {showBoard ? (
              <a href={`/board?plot=${encodeURIComponent(site.slug)}`}>Board</a>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

function OwnSpace({
  qualify,
  onOpen,
  onHow,
  enquiryId,
}: {
  qualify: Qualify;
  onOpen: (id: Door) => void;
  onHow: () => void;
  enquiryId: string | null;
}) {
  return (
    <div className="campus-land">
      <p className="bench-kicker">Your space</p>
      <h1>Hello, {qualify.name}.</h1>
      <p className="campus-lead">{lineForScale(qualify.scale)}</p>
      <div className="campus-tiles">
        {TILES.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={`campus-tile is-${tile.id}`}
            onClick={() => onOpen(tile.id)}
          >
            <span className="campus-n">{tile.n}</span>
            <h2>{tile.name}</h2>
            <ul>
              {pointsForScale(tile.id, qualify.scale).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>
      {enquiryId ? (
        <OnboardChat enquiryId={enquiryId} email={qualify.email} />
      ) : null}
      <p className="campus-foot">
        <button type="button" onClick={onHow}>
          How we work
        </button>
      </p>
    </div>
  );
}

function PlotWho({
  lab = false,
  onDone,
  onCancel,
}: {
  lab?: boolean;
  onDone: (row: Qualify, id?: string) => void;
  onCancel: () => void;
}) {
  const [scale, setScale] = useState<ScaleId | null>(null);
  const [hereFor, setHereFor] = useState<Facet[]>([]);
  const [picks, setPicks] = useState<LineId[]>([]);
  const [access, setAccess] = useState<AccessId | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  function toggleDoor(id: Facet) {
    setHereFor((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      setPicks((lines) =>
        lines.filter((line) => {
          const row = lineById(line);
          return row ? next.includes(row.facet) : false;
        }),
      );
      return next;
    });
  }

  function toggleLine(id: LineId) {
    setPicks((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!scale || !hereFor.length || !access) return;
    setError("");
    const form = new FormData(e.currentTarget);
    const brief = String(form.get("message") || "").trim() || undefined;
    const row: Qualify = {
      name: String(form.get("name") || "").trim(),
      email: String(form.get("email") || "").trim(),
      phone: String(form.get("phone") || "").trim() || undefined,
      scale,
      hereFor,
      lines: picks,
      access,
      needId: needIdFromQualify(
        scale,
        hereFor,
        picks[0] ? lineById(picks[0])?.needId : undefined,
        access,
      ),
      message: brief,
    };
    const message = bookMessage({
      scale: row.scale,
      hereFor: row.hereFor,
      lineNames: picks
        .map((id) => lineById(id)?.name)
        .filter((n): n is string => Boolean(n)),
      access: row.access,
      message: brief,
    });
    setPending(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: row.name,
        email: row.email,
        phone: row.phone,
        needId: row.needId,
        scale: row.scale,
        hereFor: row.hereFor,
        lines: row.lines,
        access: row.access,
        message,
      }),
    });
    setPending(false);
    const data = (await res.json().catch(() => null)) as { id?: string } | null;
    if (!res.ok) {
      setError("That didn’t send. Write to build@designlabnorth.com.");
      return;
    }
    writeQualify({ ...row, message });
    onDone({ ...row, message }, data?.id);
  }

  const sendLabel =
    access === "client"
      ? "Sign in to my site"
      : access === "board"
        ? "Open my account"
        : "Open my space";
  const accessRows = lab ? ACCESS : ACCESS.filter((row) => row.id !== "board");

  return (
    <div className="campus-ticket-wrap campus-who">
      <div className="campus-ticket-tabs">
        <span className="campus-tab">Campus</span>
        <span className="campus-plus" aria-hidden>
          <span>+</span>
          Add your own site
        </span>
      </div>
      <div className="campus-ticket">
        <p className="bench-kicker">Start with us</p>
        <h1>Who are you?</h1>
        <p className="campus-lead">
          Size of the work first, then what you are actually here for.
        </p>
        <div className="campus-scales">
          {SCALES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={scale === s.id ? "is-on" : undefined}
              onClick={() => setScale(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
        {scale ? (
          <>
            <p className="campus-lead">{lineForScale(scale)}</p>
            <h2>What are you here for?</h2>
            <p className="campus-hint">
              Design, Strategy, and Build are bigger than one need. Pick what
              you came for — you can pick more than one.
            </p>
            <div className="campus-scales">
              {HERE_FOR.map((door) => (
                <button
                  key={door.id}
                  type="button"
                  className={hereFor.includes(door.id) ? "is-on" : undefined}
                  onClick={() => toggleDoor(door.id)}
                >
                  {door.label}
                </button>
              ))}
            </div>
          </>
        ) : null}
        {scale && hereFor.length ? (
          <>
            <h2>Specifically</h2>
            <p className="campus-hint">
              Which of these, if you know. Leave them if you want the whole of
              that door.
            </p>
            {HERE_FOR.filter((door) => hereFor.includes(door.id)).map(
              (door) => (
                <div key={door.id} className="campus-pick-group">
                  <p className="bench-kicker">{door.label}</p>
                  <div className="campus-picks">
                    {linesFor(door.id).map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        className={picks.includes(row.id) ? "is-on" : undefined}
                        onClick={() => toggleLine(row.id)}
                      >
                        {row.name}
                      </button>
                    ))}
                  </div>
                </div>
              ),
            )}
            <h2>How we meet you</h2>
            <p className="campus-hint">
              {lab
                ? "New work, hosting, the board, learning, or a site you already have."
                : "New work, hosting, learning, or a site you already have."}
            </p>
            <div className="campus-access">
              {accessRows.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className={access === row.id ? "is-on" : undefined}
                  onClick={() => setAccess(row.id)}
                >
                  <strong>{row.label}</strong>
                  <span>{row.line}</span>
                </button>
              ))}
            </div>
          </>
        ) : null}
        {scale && hereFor.length && access ? (
          <form className="bench-note" onSubmit={onSubmit}>
            <label htmlFor="plot-name">Name</label>
            <input id="plot-name" name="name" required autoComplete="name" />
            <label htmlFor="plot-email">Email</label>
            <input
              id="plot-email"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
            <label htmlFor="plot-phone">Phone</label>
            <input id="plot-phone" name="phone" type="tel" autoComplete="tel" />
            <label htmlFor="plot-msg">Anything else, in brief</label>
            <textarea id="plot-msg" name="message" rows={4} />
            <button type="submit" disabled={pending}>
              {pending ? "…" : sendLabel}
            </button>
            <button type="button" className="act-quiet" onClick={onCancel}>
              Back
            </button>
            {error ? <p className="err">{error}</p> : null}
          </form>
        ) : (
          <p>
            <button type="button" className="act-quiet" onClick={onCancel}>
              Back
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

function HostRoom({
  lab,
  onContact,
}: {
  lab?: boolean;
  onContact: (needId?: string) => void;
}) {
  return (
    <div className="bench-room bench-spring">
      <header className="bench-app-bar">
        <div>
          <p className="bench-kicker">BoomStack</p>
          <h1>BoomStack</h1>
        </div>
        <div className="bench-app-acts">
          <button
            type="button"
            className="bench-cta"
            onClick={() => onContact("walk-build-host")}
          >
            Contact
          </button>
        </div>
      </header>
      <p className="campus-lead spring-line">{BOOMSTACK_LINE}</p>
      <ol className="spring-rise">
        {BOOM_STACKS.map((stack) => {
          const amount = catalogueById(stack.presetId)?.amountGbp || 0;
          const price =
            lab && amount > 0
              ? new Intl.NumberFormat("en-GB", {
                  style: "currency",
                  currency: "GBP",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(amount)
              : "";
          return (
            <li
              key={stack.n}
              className="spring-plate"
              style={{ ["--rise" as string]: String(stack.rise) }}
            >
              <div className="spring-copy">
                <b aria-hidden="true">{stack.n}</b>
                <h2>{stack.name}</h2>
                <p className="spring-traffic">{stack.traffic}</p>
                <ul>
                  {stack.bits.map((bit) => (
                    <li key={bit}>{bit}</li>
                  ))}
                </ul>
                {price ? (
                  <p className="spring-price">
                    {price} <span>a month</span>
                  </p>
                ) : (
                  <p className="spring-price is-quiet">{stack.traffic}</p>
                )}
              </div>
              <i className="spring-fill" aria-hidden />
            </li>
          );
        })}
      </ol>
      <p className="campus-lead spring-foot">
        Live and sandbox are one host. A comment in the evening; a hotfix we try
        to audit within the hour. Heavy traffic is a conversation.
      </p>
    </div>
  );
}

function BoardRoom({
  signedIn,
  mode,
  setMode,
  sense,
  setSense,
  research,
  note,
  setNote,
  noteOk,
  noteErr,
  pending,
  onNote,
}: {
  signedIn: boolean;
  mode: "change" | "plan" | "note";
  setMode: (m: "change" | "plan" | "note") => void;
  sense: "narrative" | "sensory";
  setSense: (s: "narrative" | "sensory") => void;
  research: readonly string[];
  note: string;
  setNote: (v: string) => void;
  noteOk: string;
  noteErr: string;
  pending: boolean;
  onNote: (e: FormEvent) => void;
}) {
  if (!signedIn) {
    return (
      <div className="bench-room bench-loss">
        <div>
          <p className="bench-kicker">Board</p>
          <h1>Sign in to open the table</h1>
          <p>The research board is for people with a site on their account.</p>
          <Link className="bench-cta" href="/login?next=/board">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bench-room bench-board">
      <div className="bench-board-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="bench-seal" src={MERZ_SEAL.file} alt="" />
        <div className="bench-senses">
          <button
            type="button"
            className={sense === "narrative" ? "is-on" : undefined}
            onClick={() => setSense("narrative")}
          >
            Narrative
          </button>
          <button
            type="button"
            className={sense === "sensory" ? "is-on" : undefined}
            onClick={() => setSense("sensory")}
          >
            Sensory
          </button>
        </div>
        <p className="bench-kicker">Inference</p>
        <p className="campus-lead">
          These lines are the plot&apos;s branded profile. They contextualise
          prompts run on the board — depth specific to them, a book that grows.
        </p>
        <ul className="bench-bits">
          {BRAND_BITS_LEFT.map((bit) => (
            <li key={bit.id}>{bit.label}</li>
          ))}
        </ul>
        <p>
          <Link className="bench-word" href="/board">
            Open the plot board
          </Link>
        </p>
      </div>
      <div className="bench-board-main">
        <div className="bench-room-head">
          <div>
            <p className="bench-kicker">Client</p>
            <h1>Merz Barn</h1>
          </div>
          <div className="bench-modes" role="tablist" aria-label="Board mode">
            {(["change", "plan", "note"] as const).map((id) => (
              <button
                key={id}
                type="button"
                className={mode === id ? "is-on" : undefined}
                onClick={() => setMode(id)}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
        {mode === "change" ? (
          <div className="bench-research">
            <p className="bench-kicker">Research</p>
            <div className="bench-research-grid">
              {research.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={src} src={src} alt="" />
              ))}
            </div>
          </div>
        ) : null}
        {mode === "plan" ? (
          <ol className="bench-plan">
            {ENGINE_STAGES.map((stage) => (
              <li key={stage.n}>
                <span>{stage.n.padStart(2, "0")}</span>
                {stage.name}
              </li>
            ))}
          </ol>
        ) : null}
        {mode === "note" ? (
          <form className="bench-note" onSubmit={onNote}>
            <label htmlFor="bench-note">Note</label>
            <textarea
              id="bench-note"
              rows={6}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              required
            />
            <button type="submit" disabled={pending}>
              {pending ? "…" : "Put on the board"}
            </button>
            {noteOk ? <p>{noteOk}</p> : null}
            {noteErr ? <p className="err">{noteErr}</p> : null}
            <p>
              The live plot board stays at <Link href="/board">/board</Link>.
            </p>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function FacultyRoom({
  faculty,
  onSolport,
  onEngine,
}: {
  faculty: Faculty;
  onSolport: () => void;
  onEngine: () => void;
}) {
  return (
    <div className="bench-room bench-faculty-room">
      <p className="bench-kicker">How we work</p>
      <h1>
        {faculty.n} {faculty.name}
      </h1>
      <p className="campus-lead">{faculty.caption}</p>
      <div className="bench-faculty-grid">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={faculty.plate} alt="" />
        <div>
          <p>
            <strong>Foundation.</strong> {faculty.foundation}
          </p>
          <p>
            <strong>Approach.</strong> {faculty.approach}
          </p>
          <p>
            <strong>Goal.</strong> {faculty.goal}
          </p>
          {faculty.id === "solport" ? (
            <>
              <BrandStrip room="solport" />
              <button type="button" className="bench-cta" onClick={onSolport}>
                Book a working session
              </button>
            </>
          ) : null}
          {faculty.id === "process" ? (
            <button type="button" className="bench-cta" onClick={onEngine}>
              Open How we work
            </button>
          ) : null}
          {faculty.id === "identity" ? (
            <BrandStrip room="identity" />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function EngineRoom({
  stageN,
  setStageN,
  pipe,
  setPipe,
}: {
  stageN: number;
  setStageN: (n: number) => void;
  pipe: PipelineId;
  setPipe: (id: PipelineId) => void;
}) {
  const stage = ENGINE_STAGES[stageN];
  const active = PIPELINES.find((p) => p.id === pipe)!;
  return (
    <div className="bench-room bench-engine">
      <p className="bench-kicker">How we work</p>
      <ol className="bench-engine-switch">
        {ENGINE_STAGES.map((s, i) => (
          <li key={s.n}>
            <button
              type="button"
              className={i === stageN ? "is-on" : undefined}
              onClick={() => setStageN(i)}
              aria-label={s.name}
              aria-current={i === stageN ? "true" : undefined}
            >
              {s.n}
            </button>
          </li>
        ))}
      </ol>
      <div className="bench-engine-now">
        <figure className="bench-engine-plate">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={stage.plate} alt="" />
        </figure>
        <div>
          <h1>{stage.name}</h1>
          <p className="campus-lead">{stage.body}</p>
          <p>{stage.more}</p>
        </div>
      </div>
      <ol className="bench-engine-track" aria-hidden>
        {ENGINE_STAGES.map((s, i) => (
          <li
            key={s.n}
            className={
              i === stageN ? "is-on" : i < stageN ? "is-did" : undefined
            }
          >
            <i />
          </li>
        ))}
      </ol>
      <BrandStrip room="engine" />
      <div className="bench-pipes">
        {PIPELINES.map((p) => (
          <button
            key={p.id}
            type="button"
            className={pipe === p.id ? "is-on" : undefined}
            onClick={() => setPipe(p.id)}
          >
            {p.name}
          </button>
        ))}
      </div>
      <p className="bench-sub">{active.path}</p>
      <ul className="bench-outputs">
        {active.outputs.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function SupplierRoom() {
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    const geo = String(form.get("geo") || "");
    const spec = String(form.get("spec") || "");
    const tier = String(form.get("tier") || "").trim();
    const message = [
      "Approved Supplier application.",
      `Geography: ${geo}.`,
      `Work: ${spec}.`,
      tier ? `Client tier: ${tier}.` : "",
      String(form.get("message") || "").trim(),
    ]
      .filter(Boolean)
      .join(" ");
    setPending(true);
    const res = await fetch("/api/enquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        needId: "social-supplier",
        message,
      }),
    });
    setPending(false);
    if (!res.ok) {
      setError("That didn’t send. Write to build@designlabnorth.com.");
      return;
    }
    setOk(true);
    e.currentTarget.reset();
  }

  return (
    <div className="bench-room bench-supplier">
      <p className="bench-kicker">Partners</p>
      <h1>Approved Supplier</h1>
      <p className="campus-lead">
        We choose not to get mired in social media execution. We pass that work
        to trusted specialists in Manchester, Lancashire, Cumbria, the Borders,
        and southern Scotland.
      </p>
      <ul className="bench-outputs">
        <li>Direct referrals</li>
        <li>Zero overlap — we stay on strategy, design, and web builds</li>
        <li>A regional list, not a marketplace</li>
      </ul>
      {ok ? (
        <p>We have it. We’ll write back about the list.</p>
      ) : (
        <form className="bench-note" onSubmit={onSubmit}>
          <label htmlFor="sup-name">Name</label>
          <input id="sup-name" name="name" required autoComplete="name" />
          <label htmlFor="sup-email">Email</label>
          <input
            id="sup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <label htmlFor="sup-phone">Phone</label>
          <input id="sup-phone" name="phone" type="tel" autoComplete="tel" />
          <label htmlFor="sup-geo">Primary geographic focus</label>
          <select id="sup-geo" name="geo" required defaultValue="manchester">
            <option value="manchester">Manchester hub</option>
            <option value="lancashire">Lancashire</option>
            <option value="cumbria">Cumbria</option>
            <option value="borders">Scottish Borders</option>
            <option value="scotland">Southern Scotland</option>
          </select>
          <label htmlFor="sup-spec">Specialisation</label>
          <select id="sup-spec" name="spec" required defaultValue="organic">
            <option value="organic">Organic community and content</option>
            <option value="paid">Paid social ad management</option>
            <option value="both">Both</option>
          </select>
          <label htmlFor="sup-tier">Typical client tier or monthly budget</label>
          <input id="sup-tier" name="tier" />
          <label htmlFor="sup-msg">A little more</label>
          <textarea id="sup-msg" name="message" rows={4} />
          <button type="submit" disabled={pending}>
            {pending ? "…" : "Reply to join the list"}
          </button>
          {error ? <p className="err">{error}</p> : null}
        </form>
      )}
    </div>
  );
}
