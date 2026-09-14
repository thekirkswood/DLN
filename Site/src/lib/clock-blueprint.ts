import type { Blueprint, BlueprintLink, BlueprintNode, BlueprintViewer } from "@/lib/clock-types";
import { LAN_IP, isDlnLocalHost, namedOrigin } from "@/lib/lan-names";
import { hostnameOf } from "@/lib/lab-host";

export const LAN_HOST = LAN_IP;

const PROBE_MS = 1600;

export type BlueprintDef = {
  id: string;
  name: string;
  party: BlueprintNode["party"];
  port: number | null;
  liveUrl: string | null;
  liveClock: string | null;
  labPath: string;
  labDesk: string | null;
  healthPath: string | null;
  disk: string;
  github: string;
  note: string;
};

export const BLUEPRINT_DEFS: BlueprintDef[] = [
  {
    id: "builder",
    name: "Lab",
    party: "lab",
    port: 3100,
    liveUrl: null,
    liveClock: null,
    labPath: "",
    labDesk: "http://builder.dln.local",
    healthPath: "/",
    disk: "/home/main/Repos/Builder",
    github: "",
    note: "Design queues. Dave: builder.dln.local. Backup LAN :3100. Not the Clock.",
  },
  {
    id: "modyu",
    name: "ModYu",
    party: "client",
    port: 3000,
    liveUrl: "https://modyu.designlabnorth.com",
    liveClock: null,
    labPath: "",
    labDesk: "http://builder.dln.local/modyu",
    healthPath: "/api/health",
    disk: "/home/main/ModYu",
    github: "thekirkswood/Modyu",
    note: "Anne Marie’s shop desk stays /admin. Clock may watch later.",
  },
  {
    id: "dln",
    name: "Design Lab North",
    party: "campus",
    port: 3010,
    liveUrl: "https://designlabnorth.com",
    liveClock: "https://designlabnorth.com/account?desk=clock",
    labPath: "/account?desk=clock",
    labDesk: "http://builder.dln.local/dln",
    healthPath: "/api/health",
    disk: "/home/main/DLN",
    github: "thekirkswood/DLN",
    note: "Public site plus the studio book. Dave: dln.local. Tower localhost is not on the LAN.",
  },
  {
    id: "dlnapp",
    name: "DLNAPP",
    party: "campus",
    port: 3011,
    liveUrl: null,
    liveClock: null,
    labPath: "",
    labDesk: null,
    healthPath: null,
    disk: "",
    github: "",
    note: "Port off. dlnapp.service disabled. Not a show URL.",
  },
  {
    id: "various-titles",
    name: "Various Titles",
    party: "studio",
    port: 3020,
    liveUrl: "https://varioustitles.com",
    liveClock: "https://varioustitles.com/clock",
    labPath: "/clock",
    labDesk: "http://builder.dln.local/various-titles",
    healthPath: "/api/health",
    disk: "/home/main/VariousTitles",
    github: "thekirkswood/vt",
    note: "Public Building. Studio enter copies dln_session.",
  },
  {
    id: "pfp",
    name: "Paul Fosbury Portraits",
    party: "client",
    port: 3030,
    liveUrl: "https://paulfosburyportraits.com",
    liveClock: null,
    labPath: "",
    labDesk: "http://builder.dln.local/pfp",
    healthPath: "/api/health",
    disk: "/home/main/PFP",
    github: "thekirkswood/PFP",
    note: "Public wall Building. Clock face later.",
  },
  {
    id: "dks",
    name: "Dave Kirkwood",
    party: "studio",
    port: 3040,
    liveUrl: "https://davekirkwood.com",
    liveClock: "https://davekirkwood.com/clock",
    labPath: "/clock",
    labDesk: "http://builder.dln.local/dks",
    healthPath: "/api/health",
    disk: "/home/main/DKS",
    github: "",
    note: "Public wall Building. Quiet Sign in. Clock is studio-only.",
  },
  {
    id: "daa",
    name: "DAA",
    party: "client",
    port: 3050,
    liveUrl: "https://daa.designlabnorth.com",
    liveClock: null,
    labPath: "",
    labDesk: "http://builder.dln.local/daa",
    healthPath: "/api/health",
    disk: "/home/main/DAA",
    github: "",
    note: "Reserved. Do not put Clock on /admin. Greenhouse listing later.",
  },
  {
    id: "swarm-web",
    name: "Swarm Fund web",
    party: "studio",
    port: 5173,
    liveUrl: "https://swarmfund.com",
    liveClock: "https://swarmfund.com/clock",
    labPath: "/clock",
    labDesk: "http://builder.dln.local/swarm",
    healthPath: "/",
    disk: "/home/main/SwarmFund/apps/web",
    github: "thekirkswood/Swarmfund",
    note: "Public Building until studio enter. /ops is Hive editorial.",
  },
  {
    id: "swarm-api",
    name: "Swarm Fund api",
    party: "studio",
    port: 8787,
    liveUrl: "https://swarmfund.com",
    liveClock: null,
    labPath: "",
    labDesk: "http://builder.dln.local/swarm",
    healthPath: "/api/health",
    disk: "/home/main/SwarmFund/apps/api",
    github: "thekirkswood/Swarmfund",
    note: "Census and Full Frame live here. Live health is the public API.",
  },
  {
    id: "choozlist",
    name: "Choozlist",
    party: "studio",
    port: null,
    liveUrl: null,
    liveClock: null,
    labPath: "",
    labDesk: null,
    healthPath: null,
    disk: "",
    github: "",
    note: "Out of this rail. Greenhouse story only. Own host until uploaded.",
  },
];

export const BLUEPRINT_LINKS: BlueprintLink[] = [
  {
    id: "login",
    from: "dln",
    to: "dln",
    via: "cookie",
    label: "Studio sign-in at /login writes cookie dln_session. No new password.",
  },
  {
    id: "titles-enter",
    from: "dln",
    to: "various-titles",
    via: "enter",
    label: "/api/auth/titles-enter copies the session onto varioustitles.com.",
  },
  {
    id: "swarm-enter",
    from: "dln",
    to: "swarm-web",
    via: "enter",
    label: "/api/auth/swarm-enter copies the session onto swarmfund.com.",
  },
  {
    id: "dks-enter",
    from: "dln",
    to: "dks",
    via: "enter",
    label: "/api/auth/dks-enter copies the session onto davekirkwood.com.",
  },
  {
    id: "census-swarm",
    from: "dln",
    to: "swarm-api",
    via: "census",
    label: "Overlay pulls /api/clock/census. Silence is a fact.",
  },
  {
    id: "census-vt",
    from: "dln",
    to: "various-titles",
    via: "census",
    label: "Overlay pulls Titles census. Grant truth stays on this book.",
  },
  {
    id: "census-dks",
    from: "dln",
    to: "dks",
    via: "census",
    label: "Overlay pulls Dave Kirkwood census. Public stays Building.",
  },
  {
    id: "lab-dln",
    from: "builder",
    to: "dln",
    via: "inbox",
    label: "Lab desk builder.dln.local/dln writes _meta/lab-inbox. Sniffer jumps here.",
  },
  {
    id: "lab-vt",
    from: "builder",
    to: "various-titles",
    via: "inbox",
    label: "Lab desk :3100/various-titles → Titles inbox.",
  },
  {
    id: "lab-swarm",
    from: "builder",
    to: "swarm-web",
    via: "inbox",
    label: "Lab desk :3100/swarm → Swarm inbox. /ops stays editorial.",
  },
  {
    id: "lab-dks",
    from: "builder",
    to: "dks",
    via: "inbox",
    label: "Lab desk :3100/dks → DKS inbox.",
  },
  {
    id: "lab-modyu",
    from: "builder",
    to: "modyu",
    via: "inbox",
    label: "Lab desk :3100/modyu → designer inbox. Shop desk stays hers.",
  },
  {
    id: "lab-pfp",
    from: "builder",
    to: "pfp",
    via: "inbox",
    label: "Lab desk :3100/pfp → PFP inbox.",
  },
  {
    id: "lab-daa",
    from: "builder",
    to: "daa",
    via: "inbox",
    label: "Lab desk :3100/daa → DAA inbox. Never Clock on /admin.",
  },
  {
    id: "grant",
    from: "dln",
    to: "various-titles",
    via: "grant",
    label: "titlesGrant is billed here. Titles reports reads, not bodies.",
  },
  {
    id: "apply",
    from: "builder",
    to: "dln",
    via: "apply",
    label: "apply-house lands files downstairs. Not a public VPS ship.",
  },
  {
    id: "watch-wall",
    from: "dln",
    to: "dln",
    via: "wall",
    label: "Watch is probe/ban. Clock cites trap first/last. Not a second ban UI.",
  },
];

export function viewerFromHost(hostHeader: string | null): BlueprintViewer {
  const host = hostnameOf(hostHeader);
  if (host === LAN_HOST) return "lan";
  if (isDlnLocalHost(host) || host.endsWith(".local")) return "lan";
  if (host === "localhost" || host === "127.0.0.1") return "local";
  if (host.startsWith("192.168.") || host.startsWith("10.")) return "lan";
  return "live";
}

function origin(host: string, port: number): string {
  return `http://${host}:${port}`;
}

async function probe(url: string): Promise<{ sitting: boolean; latencyMs: number | null }> {
  const started = Date.now();
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PROBE_MS);
  try {
    await fetch(url, { cache: "no-store", signal: ctrl.signal, redirect: "manual" });
    return { sitting: true, latencyMs: Date.now() - started };
  } catch {
    return { sitting: false, latencyMs: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

function lanDesk(url: string | null): string | null {
  if (!url) return null;
  return url
    .replace("http://localhost:3100", `http://${LAN_HOST}:3100`)
    .replace("http://builder.dln.local", `http://${LAN_HOST}:3100`);
}

function namedFor(def: BlueprintDef): string | null {
  return namedOrigin(def.id);
}

export async function buildBlueprint(hostHeader: string | null): Promise<Blueprint> {
  const viewer = viewerFromHost(hostHeader);
  const probeLab = viewer !== "live";

  const nodes: BlueprintNode[] = await Promise.all(
    BLUEPRINT_DEFS.map(async (def) => {
      const localhost = def.port != null ? origin("127.0.0.1", def.port) : null;
      const lan = def.port != null ? origin(LAN_HOST, def.port) : null;
      const named = namedFor(def);
      const health = def.healthPath || "/";
      let sittingLocal: boolean | null = null;
      let sittingLan: boolean | null = null;
      let latencyLocal: number | null = null;
      let latencyLan: number | null = null;
      if (def.port === 3011) {
        sittingLocal = false;
        sittingLan = false;
      } else if (probeLab && def.port != null && def.healthPath) {
        const [local, lanHit] = await Promise.all([
          probe(`${localhost}${health}`),
          probe(`${lan}${health}`),
        ]);
        sittingLocal = local.sitting;
        sittingLan = lanHit.sitting;
        latencyLocal = local.latencyMs;
        latencyLan = lanHit.latencyMs;
      }
      return {
        id: def.id,
        name: def.name,
        party: def.party,
        port: def.port,
        localhost,
        lan,
        named,
        liveUrl: def.liveUrl,
        liveClock: def.liveClock,
        labClock: localhost && def.labPath ? `${localhost}${def.labPath}` : null,
        lanClock: named && def.labPath ? `${named}${def.labPath}` : lan && def.labPath ? `${lan}${def.labPath}` : null,
        namedDesk: def.labDesk,
        namedClock: named && def.labPath ? `${named}${def.labPath}` : null,
        labDesk: def.labDesk?.replace("http://builder.dln.local", "http://localhost:3100") || def.labDesk,
        lanDesk: lanDesk(def.labDesk),
        disk: def.disk,
        github: def.github,
        note: def.note,
        sittingLocal,
        sittingLan,
        latencyLocal,
        latencyLan,
      };
    }),
  );

  return {
    viewer,
    lanHost: LAN_HOST,
    nodes,
    links: BLUEPRINT_LINKS,
  };
}
