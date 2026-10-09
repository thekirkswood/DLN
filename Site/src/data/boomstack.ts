export const BOOMSTACK_LINE =
  "Live host, sandbox, and the dashboard on our subdomain.";

export type BoomStackId = 1 | 2 | 3;

export const BOOM_STACKS: {
  n: BoomStackId;
  name: string;
  traffic: string;
  bits: string[];
  presetId: string;
  rise: number;
}[] = [
  {
    n: 1,
    name: "Stack 1",
    traffic: "Low traffic",
    bits: ["Hosting", "Sandbox", "Strategy underneath"],
    presetId: "springstack-1",
    rise: 34,
  },
  {
    n: 2,
    name: "Stack 2",
    traffic: "Medium traffic",
    bits: ["Hosting", "Sandbox", "Shop", "Press kit"],
    presetId: "springstack-2",
    rise: 62,
  },
  {
    n: 3,
    name: "Stack 3",
    traffic: "High traffic",
    bits: ["Hosting", "Sandbox", "Shop", "Press kit", "A.P.E.S."],
    presetId: "springstack-3",
    rise: 88,
  },
];

/** Billing ids stay `springstack-*` so existing rolls keep counting. */
export const TOKEN_PRESETS: Record<string, BoomStackId> = {
  "springstack-1": 1,
  "springstack-2": 2,
  "springstack-3": 3,
  "boomstack-1": 1,
  "boomstack-2": 2,
  "boomstack-3": 3,
  "host-monthly": 1,
};

export const DEFAULT_TOKEN_GRANTS: Record<BoomStackId, number> = {
  1: 40,
  2: 100,
  3: 250,
};

export const DEFAULT_PING_COST = 8;
export const DEFAULT_CAPTURE_COST = 2;
export const DEFAULT_GEN_COST = 12;
