export type WatchHit = {
  t: string;
  path: string;
  host: string;
  trap: boolean;
};

export type WatchInstance = {
  id: string;
  t: string;
  last: string;
  ip: string;
  ua: string;
  host: string;
  plot?: string;
  userId?: string;
  email?: string;
  role?: string;
  displayName?: string;
  paths: WatchHit[];
  retro?: boolean;
  /** Studio cleared this poke off Open. Trap web still holds the count. */
  cleared?: boolean;
};
