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
  | "system"
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
  blurb: string;
  items: ModyuNavLink[];
};

export function pageHref(rest = ""): string {
  const tail = rest.replace(/^\/+/, "");
  return tail ? `/epk/modyu/${tail}` : "/epk/modyu";
}

export function modyuNav(): ModyuNavGroup[] {
  return [
    {
      title: "Brand & background",
      blurb: "Company, founder, culture.",
      items: [
        { id: "our-story", href: pageHref("our-story"), label: "Our story" },
        { id: "founder", href: pageHref("founder"), label: "Ann-Marie [Founder]" },
        { id: "follicle", href: pageHref("follicle"), label: "The Follicle Files" },
        { id: "quotes", href: pageHref("quotes"), label: "Quote bank" },
        { id: "about", href: pageHref("about"), label: "About ModYu" },
      ],
    },
    {
      title: "Campaigns",
      blurb: "Download each as its own PDF.",
      items: [
        { id: "campaigns", href: pageHref("campaigns"), label: "Stories ready to run" },
        { id: "angles", href: pageHref("angles"), label: "Further angles" },
      ],
    },
    {
      title: "Product & service",
      blurb: "HT4 system, evidence, and claims.",
      items: [
        { id: "system", href: pageHref("system"), label: "The HT4 system" },
        { id: "evidence", href: pageHref("evidence"), label: "The evidence" },
        { id: "claims", href: pageHref("claims"), label: "What we claim — and won’t" },
        { id: "facts", href: pageHref("facts"), label: "Fast facts & FAQ" },
        { id: "vault", href: pageHref("vault"), label: "Asset vault" },
        { id: "contact", href: pageHref("contact"), label: "Contact" },
      ],
    },
  ];
}

export const PAGE_IDS = new Set<string>([
  "our-story",
  "founder",
  "follicle",
  "quotes",
  "about",
  "campaigns",
  "system",
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
  if (id === "home" || id === "campaigns") return "Stories ready to run";
  if (id === "our-story") return doc.story.title;
  if (id === "founder") return doc.founder?.title || "Ann-Marie [Founder]";
  if (id === "follicle") return doc.satellite?.title || "The Follicle Files";
  if (id === "quotes") return "Quote bank";
  if (id === "about") return doc.about?.title || "About ModYu";
  if (id === "system") return doc.system?.title || "The HT4 system";
  if (id === "evidence") return doc.evidence?.title || "The evidence";
  if (id === "claims") return doc.claims?.title || "What we claim — and won’t";
  if (id === "facts") return "Fast facts & FAQ";
  if (id === "angles") return "Further angles";
  if (id === "vault") return "Asset vault";
  return doc.contact.name || "Contact";
}

export function extraCampaigns(stories: EpkStory[]): EpkStory[] {
  return stories.filter((row) => !row.seeded);
}
