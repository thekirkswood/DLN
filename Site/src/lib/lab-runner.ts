import { spawn, execFileSync } from "child_process";
import { createConnection } from "net";
import {
  openSync,
  closeSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readFileSync,
  unlinkSync,
  appendFileSync,
} from "fs";
import path from "path";
import { labBasePath, resolveHouse, type LabHouse } from "@/lib/lab";
import { ensureHouseInbox, listLabMessages } from "@/lib/lab-inbox";

const ROOT = path.join(process.cwd(), "..", "_meta", "lab-houses");

export type HouseRunStatus = "ready" | "starting" | "down" | "missing";

export type HouseRun = {
  slug: string;
  name: string;
  port: number | null;
  status: HouseRunStatus;
  occupancy: number;
};

type ProcSpec = {
  id: string;
  cwd: string;
  port: number;
  env: Record<string, string>;
  cmd: string;
  args: string[];
};

const starting = new Map<string, Promise<HouseRunStatus>>();
/** slug → leaseId → expiry ms. A unit app runs while this is above zero. */
const leases = new Map<string, Map<string, number>>();
const stopTimers = new Map<string, ReturnType<typeof setTimeout>>();
let sweepArmed = false;

const HOLD_TTL_MS = 120_000;
const STOP_GRACE_MS = 12_000;

function readyUrl(port: number, slug: string): string {
  if (slug === "swarm-api") return `http://127.0.0.1:${port}/api`;
  const base = labBasePath(slug === "swarm-api" ? "swarm" : slug);
  if (slug === "swarm") return `http://127.0.0.1:${port}${base}/`;
  return `http://127.0.0.1:${port}${base}`;
}

async function portOpen(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const sock = createConnection({ host: "127.0.0.1", port }, () => {
      sock.end();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
    sock.setTimeout(400, () => {
      sock.destroy();
      resolve(false);
    });
  });
}

async function httpUp(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(2500) });
    return res.status < 400;
  } catch {
    return false;
  }
}

function logOcc(line: string) {
  try {
    mkdirSync(ROOT, { recursive: true });
    appendFileSync(
      path.join(ROOT, "occupancy.log"),
      `${new Date().toISOString()} ${line}\n`,
      "utf8",
    );
  } catch {
    /* */
  }
}

async function specsFor(house: LabHouse): Promise<ProcSpec[]> {
  const base = labBasePath(house.slug);
  if (house.slug === "modyu") {
    return [
      {
        id: "modyu",
        cwd: path.join(house.housePath, "Site"),
        port: 3000,
        env: { BASE_PATH: base },
        cmd: "npm",
        args: ["run", "dev"],
      },
    ];
  }
  if (house.slug === "various-titles") {
    return [
      {
        id: "various-titles",
        cwd: path.join(house.housePath, "Site"),
        port: 3020,
        env: { BASE_PATH: base },
        cmd: "npm",
        args: ["run", "dev"],
      },
    ];
  }
  if (house.slug === "swarm") {
    return [
      {
        id: "swarm-api",
        cwd: path.join(house.housePath, "apps", "api"),
        port: 8787,
        env: {
          PORT: "8787",
          // Offline lab must show the full product; live Building is production-only.
          BUILDING_LOCK: "false",
          CORS_ORIGIN:
            "http://localhost:3010,http://127.0.0.1:3010,http://localhost:5173,http://127.0.0.1:5173",
        },
        cmd: "npm",
        args: ["run", "dev"],
      },
      {
        id: "swarm",
        cwd: path.join(house.housePath, "apps", "web"),
        port: 5173,
        env: {
          VITE_BASE: `${base}/`,
          // Framed at /go/swarm — absolute /api would hit the campus host.
          VITE_API_BASE: `${base}/api`,
        },
        cmd: "npm",
        args: ["run", "dev"],
      },
    ];
  }
  if (house.localPort) {
    const siteDir = path.join(house.housePath, "Site");
    if (existsSync(path.join(siteDir, "package.json"))) {
      return [
        {
          id: house.slug,
          cwd: siteDir,
          port: house.localPort,
          env: {
            BASE_PATH: base,
            PORT: String(house.localPort),
          },
          cmd: "npm",
          args: ["run", "dev"],
        },
      ];
    }
  }
  return [];
}

async function spawnSpec(spec: ProcSpec): Promise<void> {
  mkdirSync(ROOT, { recursive: true });
  const log = path.join(ROOT, `${spec.id}.log`);
  const pidFile = path.join(ROOT, `${spec.id}.pid`);
  const fd = openSync(log, "a");
  const child = spawn(spec.cmd, spec.args, {
    cwd: spec.cwd,
    env: { ...process.env, ...spec.env },
    detached: true,
    stdio: ["ignore", fd, fd],
  });
  child.unref();
  closeSync(fd);
  writeFileSync(pidFile, `${child.pid || ""}\n`, "utf8");
}

async function waitReady(spec: ProcSpec, slug: string, ms = 90000): Promise<boolean> {
  const start = Date.now();
  const url = readyUrl(spec.port, spec.id === "swarm-api" ? "swarm-api" : slug);
  while (Date.now() - start < ms) {
    if (await portOpen(spec.port)) {
      if (spec.id === "swarm-api") return true;
      if (await httpUp(url)) return true;
    }
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

function writeWantSniff(slug: string, n: number) {
  try {
    mkdirSync(ROOT, { recursive: true });
    writeFileSync(
      path.join(ROOT, `want-sniff-${slug}`),
      `${n}\n${new Date().toISOString()}\n`,
      "utf8",
    );
  } catch {
    /* */
  }
}

export function occupancyOf(slug: string): number {
  pruneLeases(slug);
  return leases.get(slug)?.size || 0;
}

function pruneLeases(slug: string) {
  const m = leases.get(slug);
  if (!m) return;
  const now = Date.now();
  for (const [id, exp] of Array.from(m.entries())) {
    if (exp <= now) m.delete(id);
  }
  if (m.size === 0) leases.delete(slug);
}

export function holdHouse(slug: string, leaseId: string, ttlMs = HOLD_TTL_MS): number {
  if (!slug || slug === "dln" || !leaseId) return occupancyOf(slug);
  const t = stopTimers.get(slug);
  if (t) {
    clearTimeout(t);
    stopTimers.delete(slug);
  }
  let m = leases.get(slug);
  if (!m) {
    m = new Map();
    leases.set(slug, m);
  }
  m.set(leaseId, Date.now() + ttlMs);
  writeWantSniff(slug, m.size);
  return m.size;
}

export function releaseHouse(slug: string, leaseId: string): number {
  if (!slug || slug === "dln") return 0;
  leases.get(slug)?.delete(leaseId);
  pruneLeases(slug);
  const n = occupancyOf(slug);
  writeWantSniff(slug, n);
  if (n === 0) scheduleStop(slug);
  return n;
}

function scheduleStop(slug: string) {
  if (slug === "dln") return;
  const prev = stopTimers.get(slug);
  if (prev) clearTimeout(prev);
  stopTimers.set(
    slug,
    setTimeout(() => {
      stopTimers.delete(slug);
      void (async () => {
        if (occupancyOf(slug) > 0 || starting.has(slug)) return;
        try {
          const rows = await listLabMessages(slug);
          if (rows.some((m) => m.status === "working")) {
            logOcc(`hold ${slug} still working`);
            scheduleStop(slug);
            return;
          }
        } catch {
          /* */
        }
        logOcc(`stop ${slug} occupancy=0`);
        void stopHouse(slug);
      })();
    }, STOP_GRACE_MS),
  );
}

function killPort(port: number) {
  if (port === 3010) return;
  try {
    execFileSync("fuser", ["-k", "-TERM", `${port}/tcp`], {
      stdio: "ignore",
      timeout: 4000,
    });
  } catch {
    /* nothing listening */
  }
}

function killPidFile(id: string) {
  const pidFile = path.join(ROOT, `${id}.pid`);
  try {
    const pid = parseInt(readFileSync(pidFile, "utf8").trim(), 10);
    if (pid) {
      try {
        process.kill(-pid, "SIGTERM");
      } catch {
        /* not a group leader */
      }
      try {
        process.kill(pid, "SIGTERM");
      } catch {
        /* already gone */
      }
    }
  } catch {
    /* no pid file */
  }
  try {
    unlinkSync(pidFile);
  } catch {
    /* */
  }
}

export async function stopHouse(slug: string): Promise<HouseRun> {
  const house = await resolveHouse(slug);
  if (!house || slug === "dln") {
    return houseRunStatus(slug);
  }
  const specs = await specsFor(house);
  for (const spec of specs) {
    killPidFile(spec.id);
    killPort(spec.port);
  }
  return houseRunStatus(slug);
}

export function armIdleSweep() {
  if (sweepArmed) return;
  sweepArmed = true;
  setInterval(() => {
    void (async () => {
      const { allLabHouses } = await import("@/lib/lab");
      const houses = await allLabHouses();
      for (const h of houses) {
        if (h.slug === "dln" || occupancyOf(h.slug) > 0 || starting.has(h.slug)) {
          continue;
        }
        const st = await houseRunStatus(h.slug);
        if (st.status === "ready" || st.status === "starting") {
          scheduleStop(h.slug);
        }
      }
    })();
  }, 15_000);
}

export async function houseRunStatus(slug: string): Promise<HouseRun> {
  const house = await resolveHouse(slug);
  if (!house) {
    return { slug, name: slug, port: null, status: "missing", occupancy: 0 };
  }
  if (slug === "dln") {
    return {
      slug,
      name: house.name,
      port: 3010,
      status: "ready",
      occupancy: 1,
    };
  }
  if (!house.localPort) {
    return {
      slug,
      name: house.name,
      port: null,
      status: "missing",
      occupancy: occupancyOf(slug),
    };
  }
  const open = await portOpen(house.localPort);
  if (!open) {
    return {
      slug,
      name: house.name,
      port: house.localPort,
      occupancy: occupancyOf(slug),
      status: starting.has(slug) ? "starting" : "down",
    };
  }
  const prefixOk = await httpUp(readyUrl(house.localPort, slug));
  return {
    slug,
    name: house.name,
    port: house.localPort,
    occupancy: occupancyOf(slug),
    status: prefixOk ? "ready" : starting.has(slug) ? "starting" : "down",
  };
}

export async function listHouseRuns(): Promise<HouseRun[]> {
  const { allLabHouses } = await import("@/lib/lab");
  const houses = await allLabHouses();
  armIdleSweep();
  return Promise.all(houses.map((h) => houseRunStatus(h.slug)));
}

export async function ensureHouse(slug: string): Promise<HouseRun> {
  const house = await resolveHouse(slug);
  if (!house) {
    return { slug, name: slug, port: null, status: "missing", occupancy: 0 };
  }
  await ensureHouseInbox(slug).catch(() => {});
  if (slug === "dln") {
    return {
      slug,
      name: house.name,
      port: 3010,
      status: "ready",
      occupancy: 1,
    };
  }
  if (!house.localPort) {
    return {
      slug,
      name: house.name,
      port: house.localPort,
      status: "missing",
      occupancy: occupancyOf(slug),
    };
  }

  const current = await houseRunStatus(slug);
  if (current.status === "ready") return current;

  const existing = starting.get(slug);
  if (existing) {
    await existing;
    return houseRunStatus(slug);
  }

  const job = (async () => {
    const specs = await specsFor(house);
    if (!specs.length) return "missing" as HouseRunStatus;
    for (const spec of specs) {
      const url = readyUrl(spec.port, spec.id === "swarm-api" ? "swarm-api" : house.slug);
      const open = await portOpen(spec.port);
      const good =
        spec.id === "swarm-api"
          ? open
          : open && (await httpUp(url));
      if (open && !good) {
        logOcc(`respawn ${spec.id} port=${spec.port} lab-prefix-miss`);
        killPidFile(spec.id);
        killPort(spec.port);
        await new Promise((r) => setTimeout(r, 400));
        await spawnSpec(spec);
      } else if (!open) {
        logOcc(`spawn ${spec.id} port=${spec.port}`);
        await spawnSpec(spec);
      }
    }
    for (const spec of specs) {
      const ok = await waitReady(spec, house.slug);
      if (!ok) return "down" as HouseRunStatus;
    }
    return "ready" as HouseRunStatus;
  })();

  starting.set(slug, job);
  try {
    await job;
    return houseRunStatus(slug);
  } finally {
    starting.delete(slug);
  }
}
