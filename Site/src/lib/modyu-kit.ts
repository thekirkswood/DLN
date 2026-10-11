import type { EpkDoc, EpkPitch } from "@/lib/epk-doc";
import type { EpkStory } from "@/lib/epk-content-model";

export type ModyuPageId =
  | "home"
  | "our-story"
  | "founder"
  | "follicle"
  | "quotes"
  | "about"
  | "campaigns"
  | "ht4"
  | "system"
  | "description"
  | "evidence"
  | "claims"
  | "facts"
  | "angles"
  | "vault"
  | "contact";

export type ModyuNavLink = {
  id: ModyuPageId;
  href: string;
  label: string;
};

export type ModyuNavGroup = {
  title: string;
  items: ModyuNavLink[];
};

export type Ht4Stage = {
  id: string;
  n: string;
  beat: string;
  name: string;
  time: string;
};

export function pageHref(rest = ""): string {
  const tail = rest.replace(/^\/+/, "");
  return tail ? `/epk/modyu/${tail}` : "/epk/modyu";
}

export function modyuNav(): ModyuNavGroup[] {
  return [
    {
      title: "Brand & background",
      items: [
        { id: "founder", href: pageHref("founder"), label: "Ann-Marie [Founder]" },
        { id: "follicle", href: pageHref("follicle"), label: "The Follicle Files" },
        { id: "quotes", href: pageHref("quotes"), label: "Quote bank" },
        { id: "about", href: pageHref("about"), label: "About ModYu" },
      ],
    },
    {
      title: "Product & service",
      items: [
        { id: "campaigns", href: pageHref("campaigns"), label: "Stories ready to run" },
        { id: "facts", href: pageHref("facts"), label: "Fast facts & FAQ" },
        { id: "vault", href: pageHref("vault"), label: "Asset vault" },
        { id: "contact", href: pageHref("contact"), label: "Contact" },
      ],
    },
  ];
}

/** Timeframes match the live HT4 site page. Copy for each stage lives on the kit document. */
export const ht4Stages: Ht4Stage[] = [
  { id: "prepare", n: "01", beat: "Prepare", name: "Balance", time: "Day −30 to Day 0" },
  { id: "protect", n: "02", beat: "Protect", name: "Cleanse", time: "Day 1 to Day 3" },
  { id: "recover", n: "03", beat: "Recover", name: "Hydrate, Bathe & Comfort", time: "Day 3 to Day 21" },
  { id: "continue", n: "04", beat: "Continue", name: "Protect & Nourish", time: "Day 21+" },
];

export const ht4Reads: ModyuNavLink[] = [
  { id: "evidence", href: pageHref("evidence"), label: "The Evidence" },
  { id: "claims", href: pageHref("claims"), label: "What we claim and what we don't" },
  { id: "our-story", href: pageHref("our-story"), label: "Our Story" },
];

export const PAGE_IDS = new Set<string>([
  "our-story",
  "founder",
  "follicle",
  "quotes",
  "about",
  "campaigns",
  "ht4",
  "system",
  "description",
  "evidence",
  "claims",
  "facts",
  "angles",
  "vault",
  "contact",
]);

export function isModyuPage(id: string): id is ModyuPageId {
  return PAGE_IDS.has(id);
}

export function pageTitle(doc: EpkDoc, id: ModyuPageId, pitch?: EpkPitch): string {
  if (pitch) return pitch.title;
  if (id === "home") return doc.kitTitle;
  if (id === "campaigns") return "Stories ready to run";
  if (id === "our-story") return doc.story.title;
  if (id === "founder") return doc.founder?.title || "Ann-Marie [Founder]";
  if (id === "follicle") return doc.satellite?.title || "The Follicle Files";
  if (id === "quotes") return "Quote bank";
  if (id === "about") return doc.about?.title || "About ModYu";
  if (id === "ht4" || id === "system" || id === "description") return "HT4";
  if (id === "evidence") return doc.evidence?.title || "The Evidence";
  if (id === "claims") return doc.claims?.title || "What we claim and what we don't";
  if (id === "facts") return "Fast facts & FAQ";
  if (id === "angles") return "Further angles";
  if (id === "vault") return "Asset vault";
  return doc.contact.name || "Contact";
}

export function extraCampaigns(stories: EpkStory[]): EpkStory[] {
  return stories.filter((row) => !row.seeded);
}

export function railOn(id: ModyuPageId, pageId: ModyuPageId, section: string): boolean {
  if (id === "campaigns") return section === "campaigns";
  if (id === "vault") return pageId === "vault";
  if (id === "ht4" || id === "system" || id === "description") {
    return pageId === "ht4" || pageId === "system" || pageId === "description";
  }
  return pageId === id;
}
