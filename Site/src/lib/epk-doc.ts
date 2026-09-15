import { daaDoc } from "@/lib/epk-docs/daa";
import { dksDoc } from "@/lib/epk-docs/dks";
import { dlnDoc } from "@/lib/epk-docs/dln";
import { genericDoc } from "@/lib/epk-docs/generic";
import { modyuDoc } from "@/lib/epk-docs/modyu";
import { pfpDoc } from "@/lib/epk-docs/pfp";
import { swarmDoc } from "@/lib/epk-docs/swarm";
import { titlesDoc } from "@/lib/epk-docs/titles";

export type VaultLaneId = "logos" | "product" | "founder" | "campaigns";

export type EpkLane = { id: VaultLaneId; label: string };

export type EpkNavItem = { href: string; label: string; sub?: string[] };

export type EpkFact = { value: string; label: string };

export type EpkPitch = {
  id: string;
  kicker?: string;
  title: string;
  question?: string;
  story: string[];
  illustration?: string[];
  whyNow?: string;
  bestFor?: string;
  evidence?: string;
  ask?: string;
};

export type EpkQuote = { text: string; cite?: string };

export type EpkQuoteGroup = { heading: string; quotes: EpkQuote[] };

export type EpkFaq = { q: string; a: string };

export type EpkPhase = { title: string; body: string };

export type EpkContact = {
  name: string;
  role?: string;
  email: string;
  web?: string;
  available?: string[];
  legal?: string;
  disclaimer: string;
};

export type EpkDoc = {
  kit: string;
  product: string;
  kitTitle: string;
  peopleLine: string;
  coverNote: string;
  coverLabels?: string[];
  lanes: EpkLane[];
  nav: EpkNavItem[];
  story: { title: string; paras: string[]; boilerplate?: { heading: string; paras: string[] } };
  storyCont?: { line: string; sub?: string; facts: EpkFact[]; source?: string };
  pitches: EpkPitch[];
  founder?: {
    kicker?: string;
    title: string;
    pull?: string;
    paras: string[];
    sidebar?: { title: string; paras: string[] };
    talksHeading?: string;
    talksIntro?: string;
    talks?: string[];
    talksNote?: string;
  };
  extras?: { intro: string; items: { desks: string; title: string; body: string[] }[] };
  system?: { title: string; intro: string[]; phases: EpkPhase[]; close?: string };
  evidence?: {
    title: string;
    intro: string;
    blocks: { title: string; body: string }[];
    canSay: string[];
    neverSay: string[];
  };
  claims?: {
    title: string;
    intro: string[];
    stand: string[];
    never: string[];
    quote?: EpkQuote;
    note?: string;
  };
  quoteBank: EpkQuoteGroup[];
  facts: { heading: string; rows: { label: string; value: string }[] };
  faqs: EpkFaq[];
  about?: {
    title: string;
    kicker?: string;
    paras: string[];
    pillars?: { title: string; body: string }[];
    pitch?: string;
  };
  satellite?: { title: string; paras: string[]; bullets?: { title: string; body: string }[] };
  contact: EpkContact;
};

export type Packish = { href: string; flags?: { logo?: boolean } };

export function skipVaultHref(href: string): boolean {
  return href.toLowerCase().includes("/play/");
}

export function vaultLane(href: string, flags?: { logo?: boolean }): VaultLaneId {
  const n = href.toLowerCase();
  if (
    /ann-marie|annmarie|ht4-people|\/portraits\/|\/dave\.png|people-lead|people-measure|people-build|people-manage|\/media\/people\/|mark-barlow|greisy-flores|\/people\/council/.test(
      n,
    )
  ) {
    return "founder";
  }
  if (
    flags?.logo ||
    /logo|mark-as-shipped|swarm-fund-mark|dln-(mute|white|ink)|\/folliclefiles\.|\/ht4\.png|\/modyu\.png|\/daa\.png|vt-logo|vt-mute|vt-white|various-titles|paulfosbury/.test(
      n,
    )
  ) {
    return "logos";
  }
  if (
    /\/products\/|\/phases\/|bottle|clinic-pack|ht4-system|founder-headshot|field-(mist|gold|sand|teal|navy|ink|gap)/.test(n)
  ) {
    return "product";
  }
  if (/\/media\/plates\//.test(n) || /\/press\/pfp\/plates\//.test(n)) return "founder";
  if (/\/media\/office\//.test(n)) return "campaigns";
  return "campaigns";
}

export function itemsForLane<T extends Packish>(items: T[], lane: VaultLaneId, cap = 12): T[] {
  return items.filter((item) => !skipVaultHref(item.href) && vaultLane(item.href, item.flags) === lane).slice(0, cap);
}

const COVER_PREFER: Record<VaultLaneId, RegExp> = {
  logos: /logo|mark-as-shipped|\/folliclefiles|\/ht4\.png|\/modyu\.png|\/daa\.png|vt-mute|dln-mute|paulfosbury/i,
  product: /bottles-lineup|clinic-pack\.png|ht4-system-main|field-mist/i,
  founder: /ann-marie|annmarie|people-lead|mark-barlow\.jpg|ht4-people-hero/i,
  campaigns: /about-follicle|ig-home-1|office-01|hero-mask/i,
};

export function coverItem<T extends Packish>(items: T[], lane: VaultLaneId): T | undefined {
  const pool = itemsForLane(items, lane, 16);
  const preferred = pool.find((item) => COVER_PREFER[lane].test(item.href));
  if (lane === "founder") {
    const images = pool.filter((item) => /\.(jpe?g|png|webp|gif|svg)$/i.test(item.href));
    return images.find((item) => COVER_PREFER[lane].test(item.href)) || images[0] || preferred || pool[0];
  }
  return preferred || pool[0];
}

export function coverPicks<T extends Packish>(items: T[], lanes: EpkLane[], perLane = 1): T[] {
  return lanes.map((lane) => coverItem(items, lane.id)).filter((item): item is T => Boolean(item)).slice(0, lanes.length * perLane);
}

export function epkDoc(id: string): EpkDoc {
  if (id === "modyu") return modyuDoc;
  if (id === "daa") return daaDoc;
  if (id === "pfp") return pfpDoc;
  if (id === "dln") return dlnDoc;
  if (id === "dks") return dksDoc;
  if (id === "swarm") return swarmDoc;
  if (id === "titles") return titlesDoc;
  return genericDoc(id);
}
