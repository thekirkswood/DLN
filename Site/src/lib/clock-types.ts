export type HouseSlug =
  | "dln"
  | "swarm"
  | "various-titles"
  | "dks"
  | "modyu"
  | "pfp"
  | "daa";

export type ClockPlane =
  | "pulse"
  | "studio"
  | "agent"
  | "product"
  | "probe"
  | "ship";

export type FactSource = "live" | "lab" | "disk";

export type ClockEntity = {
  type: string;
  id: string;
};

export type ClockEvent = {
  id: string;
  t: string;
  house: HouseSlug;
  host: string;
  plane: ClockPlane;
  kind: string;
  actor: string;
  entity?: ClockEntity;
  summary: string;
  payload?: Record<string, unknown>;
};

export type CensusRow = {
  key: string;
  house: HouseSlug;
  kind: string;
  count: number;
  firstAt: string | null;
  lastAt: string | null;
  firstActor: string;
  lastActor: string;
  firstSummary: string;
  lastSummary: string;
};

export type PulseSnap = {
  house: HouseSlug;
  name: string;
  liveUrl: string;
  clockUrl: string;
  ok: boolean | null;
  misses: number;
  lastOk: string | null;
  lastMiss: string | null;
  lastCheck: string;
  latencyMs: number | null;
  source: FactSource;
};

export type EstateSituation = {
  id: string;
  house: HouseSlug | "estate";
  tone: "ok" | "warn" | "miss" | "idle";
  title: string;
  detail: string;
};

export type EstateBrain = {
  house: HouseSlug;
  path: string;
  kind: "memory" | "chapter" | "canon" | "changelog";
  mtime: string | null;
  bytes: number;
};

export type EstateModel = {
  house: HouseSlug;
  name: string;
  detail: string;
};

export type EstateLogic = {
  house: HouseSlug;
  id: string;
  name: string;
  detail: string;
};

export type FacePack = {
  house: HouseSlug;
  source: FactSource;
  at: string;
  rows: CensusRow[];
  recent: ClockEvent[];
  error?: string;
};

export type AskAnswer = {
  question: string;
  known: boolean;
  title: string;
  body: string;
  keys: string[];
};

export type BlueprintViewer = "local" | "lan" | "live";

export type BlueprintNode = {
  id: string;
  name: string;
  party: "campus" | "lab" | "studio" | "client";
  port: number | null;
  localhost: string | null;
  lan: string | null;
  named: string | null;
  liveUrl: string | null;
  liveClock: string | null;
  labClock: string | null;
  lanClock: string | null;
  namedClock: string | null;
  labDesk: string | null;
  lanDesk: string | null;
  namedDesk: string | null;
  disk: string;
  github: string;
  note: string;
  sittingLocal: boolean | null;
  sittingLan: boolean | null;
  latencyLocal: number | null;
  latencyLan: number | null;
};

export type BlueprintLink = {
  id: string;
  from: string;
  to: string;
  via: "cookie" | "enter" | "census" | "inbox" | "grant" | "apply" | "wall";
  label: string;
};

export type Blueprint = {
  viewer: BlueprintViewer;
  lanHost: string;
  nodes: BlueprintNode[];
  links: BlueprintLink[];
};

export type LiveOverlay = {
  ok: boolean | null;
  homeIteration: number | null;
  liveIteration: number | null;
  tag: string | null;
  enquiriesOpen: number;
  suggestionsOpen: number;
  at: string | null;
  error?: string;
};

export type Estate = {
  at: string;
  overlay: FactSource;
  live: LiveOverlay;
  pulses: PulseSnap[];
  situations: EstateSituation[];
  census: CensusRow[];
  faces: FacePack[];
  brains: EstateBrain[];
  models: EstateModel[];
  logic: EstateLogic[];
  blueprint: Blueprint;
  askHints: string[];
};
