import type { HouseSlug } from "@/lib/clock-types";

export type FaceDef = {
  slug: HouseSlug;
  name: string;
  liveUrl: string;
  liveHealth: string;
  labHealth: string;
  liveCensus: string;
  labCensus: string;
  liveClock: string;
  labClock: string;
  housePath: string;
  inboxRel: string;
  changelog: string;
  iteration: string;
};

export const CLOCK_FACES: FaceDef[] = [
  {
    slug: "dln",
    name: "Design Lab North",
    liveUrl: "https://designlabnorth.com",
    liveHealth: "https://designlabnorth.com/api/health",
    labHealth: "http://127.0.0.1:3010/api/health",
    liveCensus: "https://designlabnorth.com/api/clock/census",
    labCensus: "http://127.0.0.1:3010/api/clock/census",
    liveClock: "https://designlabnorth.com/account?desk=clock",
    labClock: "http://dln.local/account?desk=clock",
    housePath: "/home/main/DLN",
    inboxRel: "_meta/lab-inbox",
    changelog: "memory/CHANGELOG.jsonl",
    iteration: "memory/ITERATION",
  },
  {
    slug: "swarm",
    name: "Swarm Fund",
    liveUrl: "https://swarmfund.com",
    liveHealth: "https://swarmfund.com/api/health",
    labHealth: "http://127.0.0.1:8787/api/health",
    liveCensus: "https://swarmfund.com/api/clock/census",
    labCensus: "http://127.0.0.1:8787/api/clock/census",
    liveClock: "https://swarmfund.com/clock",
    labClock: "http://127.0.0.1:5173/clock",
    housePath: "/home/main/SwarmFund",
    inboxRel: "_meta/lab-inbox",
    changelog: "",
    iteration: "",
  },
  {
    slug: "various-titles",
    name: "Various Titles",
    liveUrl: "https://varioustitles.com",
    liveHealth: "https://varioustitles.com/api/health",
    labHealth: "http://127.0.0.1:3020/api/health",
    liveCensus: "https://varioustitles.com/api/clock/census",
    labCensus: "http://127.0.0.1:3020/api/clock/census",
    liveClock: "https://varioustitles.com/clock",
    labClock: "http://127.0.0.1:3020/clock",
    housePath: "/home/main/VariousTitles",
    inboxRel: "_meta/lab-inbox",
    changelog: "memory/CHANGELOG.jsonl",
    iteration: "",
  },
  {
    slug: "dks",
    name: "Dave Kirkwood",
    liveUrl: "https://davekirkwood.com",
    liveHealth: "https://davekirkwood.com/api/health",
    labHealth: "http://127.0.0.1:3040/api/health",
    liveCensus: "https://davekirkwood.com/api/clock/census",
    labCensus: "http://127.0.0.1:3040/api/clock/census",
    liveClock: "https://davekirkwood.com/clock",
    labClock: "http://127.0.0.1:3040/clock",
    housePath: "/home/main/DKS",
    inboxRel: "_meta/lab-inbox",
    changelog: "",
    iteration: "",
  },
];

export function overlaySource(hostHeader: string | null): "live" | "lab" {
  const h = (hostHeader || "").split(":")[0].toLowerCase();
  if (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "dln.local" ||
    h.endsWith(".dln.local") ||
    h.endsWith(".local") ||
    h === "campus.dln.home" ||
    h.startsWith("192.168.") ||
    h.startsWith("10.")
  ) {
    return "lab";
  }
  return "live";
}
