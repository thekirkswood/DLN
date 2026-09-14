"use client";

import { useEffect, useRef, useState } from "react";

const WASH = [
  "#db328a",
  "#f26822",
  "#fed402",
  "#d3de29",
  "#00aeef",
  "#662d91",
] as const;

type Gem = { x: number; y: number; got: boolean; color: string };
type Body = { x: number; y: number; vx: number; vy: number };

function readBest(): number {
  try {
    const n = Number(localStorage.getItem("dln-cut-best"));
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function writeLocal(ms: number) {
  try {
    const prev = readBest();
    if (!prev || ms < prev) localStorage.setItem("dln-cut-best", String(ms));
  } catch {
    /* ignore */
  }
}

function formatBest(ms: number): string {
  const s = ms / 1000;
  if (s >= 60) {
    const m = Math.floor(s / 60);
    const rest = (s - m * 60).toFixed(1);
    return `${m}:${rest.padStart(4, "0")}`;
  }
  return `${s.toFixed(2)}s`;
}

async function fetchBest(): Promise<number | null> {
  try {
    const data = (await fetch("/api/plate/best", { cache: "no-store" }).then((r) =>
      r.json(),
    )) as { ms?: number | null };
    return typeof data.ms === "number" && data.ms > 0 ? data.ms : null;
  } catch {
    return null;
  }
}

async function postBest(ms: number): Promise<number | null> {
  try {
    const data = (await fetch("/api/plate/best", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ms }),
    }).then((r) => r.json())) as { ms?: number | null };
    return typeof data.ms === "number" && data.ms > 0 ? data.ms : null;
  } catch {
    return null;
  }
}

export function PlateGame({ initialBest = null }: { initialBest?: number | null }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const live = useRef(false);
  const resetRef = useRef<() => void>(() => undefined);
  const submitRef = useRef<(ms: number) => void>(() => undefined);
  const [playing, setPlaying] = useState(false);
  const [still, setStill] = useState(false);
  const [best, setBest] = useState<number | null>(initialBest);

  useEffect(() => {
    setStill(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    let gone = false;
    (async () => {
      let ms = await fetchBest();
      const local = readBest();
      if (local && (!ms || local < ms)) {
        const posted = await postBest(local);
        if (posted) ms = posted;
      }
      if (!gone) setBest(ms);
    })();
    const tick = window.setInterval(() => {
      fetchBest().then((ms) => {
        if (!gone && ms) setBest(ms);
      });
    }, 20000);
    return () => {
      gone = true;
      window.clearInterval(tick);
    };
  }, []);

  submitRef.current = (ms: number) => {
    writeLocal(ms);
    postBest(ms).then((next) => {
      if (next) setBest(next);
    });
  };

  useEffect(() => {
    const node = canvas.current;
    const stage = host.current;
    if (!node || !stage) return;

    const keys = new Set<string>();
    const pointer = { x: 0, y: 0, down: false };
    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;
    const player: Body & { r: number } = { x: 0, y: 0, vx: 0, vy: 0, r: 11 };
    let gems: Gem[] = [];
    let inks: Body[] = [];
    let started = 0;
    let done = false;
    let last = performance.now();

    function size() {
      const rect = stage.getBoundingClientRect();
      w = Math.max(280, Math.floor(rect.width));
      h = Math.max(280, Math.min(520, Math.floor(w * 0.52)));
      dpr = Math.min(2, window.devicePixelRatio || 1);
      node.width = Math.floor(w * dpr);
      node.height = Math.floor(h * dpr);
      node.style.width = `${w}px`;
      node.style.height = `${h}px`;
    }

    function place() {
      size();
      player.x = w * 0.5;
      player.y = h * 0.5;
      player.vx = 0;
      player.vy = 0;
      gems = WASH.map((color, i) => {
        const a = (Math.PI * 2 * i) / 6 + 0.2;
        return {
          x: w * 0.5 + Math.cos(a) * w * 0.32,
          y: h * 0.5 + Math.sin(a) * h * 0.28,
          got: false,
          color,
        };
      });
      inks = [
        { x: w * 0.22, y: h * 0.28, vx: 90, vy: 70 },
        { x: w * 0.78, y: h * 0.7, vx: -80, vy: -95 },
      ];
      started = 0;
      done = false;
    }

    function bounce(body: Body, r: number) {
      const pad = 18 + r;
      if (body.x < pad) {
        body.x = pad;
        body.vx = Math.abs(body.vx);
      }
      if (body.x > w - pad) {
        body.x = w - pad;
        body.vx = -Math.abs(body.vx);
      }
      if (body.y < pad) {
        body.y = pad;
        body.vy = Math.abs(body.vy);
      }
      if (body.y > h - pad) {
        body.y = h - pad;
        body.vy = -Math.abs(body.vy);
      }
    }

    function diamond(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r, y);
      ctx.closePath();
    }

    function draw(ctx: CanvasRenderingContext2D) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      const ground =
        getComputedStyle(document.documentElement).getPropertyValue("--ground").trim() ||
        "#ffffff";
      const inkCol =
        getComputedStyle(document.documentElement).getPropertyValue("--ink").trim() ||
        "#414141";
      const cut = 18;
      ctx.fillStyle = ground;
      ctx.beginPath();
      ctx.moveTo(cut, 0);
      ctx.lineTo(w - cut, 0);
      ctx.lineTo(w, cut);
      ctx.lineTo(w, h - cut);
      ctx.lineTo(w - cut, h);
      ctx.lineTo(cut, h);
      ctx.lineTo(0, h - cut);
      ctx.lineTo(0, cut);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#eeeeee";
      ctx.lineWidth = 1;
      ctx.stroke();

      for (const gem of gems) {
        if (gem.got) continue;
        ctx.fillStyle = gem.color;
        diamond(ctx, gem.x, gem.y, 7);
        ctx.fill();
      }

      ctx.fillStyle = inkCol;
      ctx.globalAlpha = 0.5;
      for (const block of inks) {
        diamond(ctx, block.x, block.y, 10);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      diamond(ctx, player.x, player.y, player.r);
      ctx.fill();
    }

    function tick(now: number) {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      if (live.current && !done) {
        if (!started) started = now;
        const acc = 520;
        if (keys.has("ArrowLeft") || keys.has("a") || keys.has("A")) player.vx -= acc * dt;
        if (keys.has("ArrowRight") || keys.has("d") || keys.has("D")) player.vx += acc * dt;
        if (keys.has("ArrowUp") || keys.has("w") || keys.has("W")) player.vy -= acc * dt;
        if (keys.has("ArrowDown") || keys.has("s") || keys.has("S")) player.vy += acc * dt;
        if (pointer.down) {
          player.vx += (pointer.x - player.x) * 6 * dt;
          player.vy += (pointer.y - player.y) * 6 * dt;
        }
        player.vx *= 0.985;
        player.vy *= 0.985;
        player.x += player.vx * dt;
        player.y += player.vy * dt;
        bounce(player, player.r);

        for (const block of inks) {
          block.x += block.vx * dt;
          block.y += block.vy * dt;
          bounce(block, 10);
          const dx = player.x - block.x;
          const dy = player.y - block.y;
          if (dx * dx + dy * dy < (player.r + 10) * (player.r + 10)) {
            for (const gem of gems) gem.got = false;
            started = now;
          }
        }

        let n = 0;
        for (const gem of gems) {
          if (gem.got) {
            n += 1;
            continue;
          }
          const dx = player.x - gem.x;
          const dy = player.y - gem.y;
          if (dx * dx + dy * dy < (player.r + 8) * (player.r + 8)) {
            gem.got = true;
            n += 1;
          }
        }
        if (n === 6) {
          done = true;
          live.current = false;
          submitRef.current(now - started);
          setPlaying(false);
        }
      }
      const ctx = node.getContext("2d");
      if (ctx) draw(ctx);
      raf = window.requestAnimationFrame(tick);
    }

    function onKey(e: KeyboardEvent) {
      if (
        live.current &&
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
      ) {
        e.preventDefault();
      }
      if (e.type === "keydown") keys.add(e.key);
      else keys.delete(e.key);
    }

    function local(e: PointerEvent) {
      const rect = node.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * w;
      pointer.y = ((e.clientY - rect.top) / rect.height) * h;
    }

    resetRef.current = () => {
      place();
      done = false;
      live.current = true;
      setPlaying(true);
    };

    place();
    const ctx = node.getContext("2d");
    if (ctx) draw(ctx);
    raf = window.requestAnimationFrame(tick);

    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    node.addEventListener("pointerdown", (e) => {
      pointer.down = true;
      local(e);
      node.setPointerCapture(e.pointerId);
    });
    node.addEventListener("pointermove", local);
    node.addEventListener("pointerup", () => {
      pointer.down = false;
    });
    window.addEventListener("resize", place);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("resize", place);
    };
  }, []);

  const board = (
    <p className="plate-game-best">{best ? `Best ${formatBest(best)}` : "Best —"}</p>
  );

  if (still) {
    return (
      <section className="plate-game wrap">
        <div className="plate-game-stage" ref={host}>
          <canvas ref={canvas} aria-label="Cut" />
          {board}
        </div>
      </section>
    );
  }

  return (
    <section className="plate-game wrap">
      <div className="plate-game-stage" ref={host}>
        <canvas ref={canvas} aria-label="Cut" />
        {board}
        {!playing ? (
          <button
            type="button"
            className="plate-game-start"
            onClick={() => resetRef.current()}
          >
            Play
          </button>
        ) : null}
      </div>
    </section>
  );
}
