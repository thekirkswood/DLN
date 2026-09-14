import pack from "@/data/daa-epk.json";
import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

const mark = pack.advisors.find((a) => a.slug === "mark-barlow");
const greisy = pack.advisors.find((a) => a.slug === "greisy-flores");
const coe = pack.offerings.find((o) => o.id === "digital-adoption-coe");
const orReady = pack.offerings.find((o) => o.id === "operational-readiness");
const vegh = pack.offerings.find((o) => o.id === "value-evidence-governance-handover");
const leak = pack.offerings.find((o) => o.id === "value-performance-optimisation");
const sitCoe = pack.situations.find((s) => s.id === "digital-adoption-capability");
const sitProg = pack.situations.find((s) => s.id === "programme-to-operations");
const sitLeak = pack.situations.find((s) => s.id === "recovering-value-after-go-live");

function titleCase(id: string): string {
  return id.slice(0, 1).toUpperCase() + id.slice(1);
}

export const daaDoc: EpkDoc = {
  kit: "daa",
  product: "DAA",
  kitTitle: "Electronic Press Kit",
  peopleLine: `${pack.company.party} · ${pack.company.name} · HyperTrack`,
  coverNote:
    "We’ll supply interviews, imagery, and stills from the constructed identity — the mark, colour fields, people, plates, and office.",
  coverLabels: ["Our story", "After go-live", "HyperTrack"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Fields" },
    { id: "founder", label: "People" },
    { id: "campaigns", label: "Office" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#founder", label: pack.company.party },
    { href: "#about", label: "About DAA" },
    { href: "#follicle", label: "HyperTrack™" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts" },
    { href: "#assets", label: "Asset Vault", sub: ["Logos", "Fields", "People", "Office"] },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [...pack.about.ledes, pack.company.voice],
    boilerplate: {
      heading: pack.about.h1,
      paras: pack.about.here.slice(0, 2),
    },
  },
  storyCont: {
    line: pack.company.line,
    sub: pack.company.voice,
    facts: [
      { value: pack.company.legal, label: "Registered company." },
      { value: pack.company.number, label: "Company number." },
      { value: "Manchester", label: pack.company.address.join(", ") },
      { value: pack.company.party, label: "Named party. Independent of DAP vendors." },
      { value: "HyperTrack™", label: "Named fast-start advisory for SAP cloud programmes." },
    ],
    source: `From Digital Adoption Advisor’s own pack (${pack.version}).`,
  },
  pitches: [
    {
      id: "value",
      kicker: pack.company.line,
      title: pack.company.voice,
      question: pack.about.h1,
      story: pack.about.here,
      whyNow: pack.about.start[0],
      bestFor: "Business, transformation and CIO desks.",
      evidence: pack.about.ledes[1],
      ask: "Design Lab North can supply identity stills and introductions. For comment on the practice, write to DAA.",
    },
    {
      id: "hypertrack",
      kicker: pack.hypertrack.kicker,
      title: pack.hypertrack.title,
      question: pack.hypertrack.ledes[0],
      story: [...pack.hypertrack.ledes, ...pack.hypertrack.for],
      illustration: pack.hypertrack.leave,
      whyNow: pack.hypertrack.for[0],
      bestFor: "SAP, transformation and CIO desks.",
      evidence: pack.hypertrack.clouds.map((c) => `${c.label}: ${c.line}`).join(" "),
      ask: "Imagery from the vault; HyperTrack framing and introductions on request.",
    },
    {
      id: "capability",
      kicker: coe?.badge || "CoE",
      title: coe?.question || pack.situations[3]?.title || "Digital Adoption as an enterprise capability",
      question: sitCoe?.title,
      story: [sitCoe?.question, coe?.lede, coe?.line].filter((p): p is string => Boolean(p)),
      whyNow: pack.groups.find((g) => g.id === "live")?.line,
      bestFor: "Trade, transformation and people-and-change desks.",
      evidence: pack.about.here[2],
      ask: "We can supply plates and the constructed mark for a piece on the identity of that practice.",
    },
    {
      id: "handover",
      kicker: pack.groups[0]?.title || "Transition & Handover",
      title: orReady?.question || sitProg?.title || "Is the receiving organisation ready?",
      question: sitProg?.title,
      story: [sitProg?.question, orReady?.lede, vegh?.lede, vegh?.line].filter((p): p is string => Boolean(p)),
      whyNow: pack.groups[0]?.line,
      bestFor: "Features and transformation desks.",
      evidence: vegh?.question,
      ask: "Imagery from the vault; comment from DAA on request.",
    },
  ],
  founder: mark
    ? {
        kicker: mark.role,
        title: mark.name,
        pull: pack.company.voice,
        paras: [mark.lede, ...(mark.body || [])],
        sidebar: {
          title: "For comment",
          paras: [
            `${pack.company.name} enquiries: ${pack.company.email}`,
            "Design Lab North host the press pack and can make the introduction.",
          ],
        },
        talksHeading: "What they can talk about",
        talksIntro: "Start from the situation. The route follows what is actually happening.",
        talks: pack.situations.map((s) => s.title).filter((t): t is string => Boolean(t)),
        talksNote:
          "Use the quote bank, or write to Design Lab North for an introduction to Mark Barlow.",
      }
    : undefined,
  extras: {
    intro: "Further angles from the same pack.",
    items: [
      {
        desks: "Executive time",
        title: pack.sessions.h1,
        body: [
          pack.sessions.ledes[0],
          pack.sessions.note,
          ...pack.sessions.formats.map((f) => `${f.name} (${f.time}): ${f.leave}`),
          greisy ? `${greisy.name} — ${greisy.lede}` : "",
        ].filter(Boolean),
      },
      {
        desks: "Capability community",
        title: pack.council.h1,
        body: pack.council.ledes,
      },
      {
        desks: "Live operations",
        title: leak?.title || "Value Performance & Optimisation",
        body: [sitLeak?.title, sitLeak?.question, leak?.lede].filter((p): p is string => Boolean(p)),
      },
    ],
  },
  system: {
    title: "Colour fields",
    intro: [
      `The visual system is ${pack.fields.length} colour fields. They are the identity in this pack.`,
      "Banner art in their materials uses the field stills, not the office photographs.",
    ],
    phases: pack.fields.map((field) => ({
      title: titleCase(field.id),
      body: "Field still for press. Take it from the vault.",
    })),
    close: `${pack.fields.length} fields. One constructed identity.`,
  },
  evidence: {
    title: "How the work is grouped",
    intro: "DAA starts from what you can see. The route follows the situation — not a forced pathway.",
    blocks: pack.groups.map((g) => ({ title: g.title, body: g.line })),
    canSay: [
      pack.company.voice,
      pack.about.here[1],
      pack.hypertrack.ledes[0],
      pack.sessions.note,
      pack.about.not[0],
    ],
    neverSay: [
      "Go-live is not the same as value, and HyperTrack is not a platform sale.",
      "DAA is not a software vendor or DAP reseller.",
    ],
  },
  claims: {
    title: "What DAA is — and what it is not",
    intro: pack.about.not,
    stand: [
      "Specialist Digital Adoption and value services in the gap between transformation and sustained value.",
      "Independent of DAP vendors and of the systems integrator delivering the build.",
      "A Session, a bounded intervention, a Review or a Value Assurance Office — or no further DAA work.",
    ],
    never: [
      "Not a software vendor. Clients are not asked to buy an internal DAA technology platform.",
      "Not one consulting pathway for every client.",
      "HyperTrack™ is not a promise that go-live equals value.",
    ],
    quote: { text: pack.company.voice, cite: pack.company.name },
    note: pack.about.start[0],
  },
  quoteBank: [
    {
      heading: "From the practice",
      quotes: [
        { text: pack.company.voice, cite: pack.company.name },
        { text: pack.about.ledes[0], cite: pack.company.name },
        { text: pack.about.here[0], cite: pack.company.name },
        { text: pack.about.here[1], cite: pack.company.name },
        { text: pack.about.here[3], cite: pack.company.name },
      ],
    },
    {
      heading: "Mark Barlow",
      quotes: mark
        ? [
            { text: mark.lede, cite: `${mark.name}, ${mark.role}` },
            ...(mark.body || []).map((text) => ({ text, cite: mark.name })),
          ]
        : [],
    },
    {
      heading: "HyperTrack™",
      quotes: [
        { text: pack.hypertrack.ledes[0], cite: pack.hypertrack.kicker },
        { text: pack.hypertrack.ledes[1], cite: pack.hypertrack.kicker },
        { text: pack.hypertrack.for[0], cite: pack.hypertrack.kicker },
        ...pack.hypertrack.clouds.map((c) => ({ text: `${c.label}: ${c.line}`, cite: pack.hypertrack.kicker })),
      ],
    },
    {
      heading: "Sessions and Council",
      quotes: [
        { text: pack.sessions.note, cite: pack.sessions.h1 },
        { text: pack.sessions.ledes[1], cite: pack.sessions.h1 },
        { text: pack.council.ledes[2], cite: pack.council.h1 },
        { text: pack.council.ledes[0], cite: pack.council.h1 },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Name", value: `${pack.company.name} (DAA)` },
      { label: "Line", value: pack.company.line },
      { label: "Legal", value: `${pack.company.legal} · ${pack.company.number}` },
      { label: "Address", value: pack.company.address.join(", ") },
      { label: "Named party", value: pack.company.party },
      { label: "Named service", value: "HyperTrack™ — fast-start advisory for SAP cloud programmes" },
      { label: "Sessions", value: pack.sessions.formats.map((f) => `${f.name} (${f.time})`).join("; ") },
      {
        label: "Identity",
        value: `Constructed mark and ${pack.fields.length} colour fields (${pack.fields.map((f) => f.id).join(", ")})`,
      },
      { label: "This pack", value: "Mark, fields, people, plates, office stills." },
      { label: "Enquiries", value: pack.company.email },
      { label: "Hosted by", value: "Design Lab North" },
    ],
  },
  faqs: [
    {
      q: "Is this their live public site?",
      a: "No. This pack is the stills and files Design Lab North keep for press. It does not replace their own site.",
    },
    {
      q: "Who speaks?",
      a: `${pack.company.party} is the named party. Design Lab North host the pack and can introduce. Practice enquiries: ${pack.company.email}.`,
    },
    {
      q: "What should we take from the vault?",
      a: "The mark, the colour fields (including gap), people stills, the plates, and a few office stills. Banner art is the fields, not the office photographs.",
    },
  ],
  about: {
    title: pack.about.h1,
    kicker: "About DAA",
    paras: [...pack.about.ledes, ...pack.about.here],
    pillars: pack.about.principles.slice(0, 6).map((body) => {
      const cut = body.indexOf(". ");
      const title = cut > 0 && cut < 48 ? body.slice(0, cut) : "How we work";
      return { title, body };
    }),
    pitch: pack.about.start[0],
  },
  satellite: {
    title: pack.hypertrack.title,
    paras: [...pack.hypertrack.ledes, ...pack.hypertrack.for, ...pack.hypertrack.leave],
    bullets: pack.hypertrack.clouds.map((c) => ({
      title: c.label,
      body: [c.line, c.body].filter(Boolean).join(" "),
    })),
  },
  contact: {
    name: "Design Lab North",
    role: "Press host",
    email: "design@designlabnorth.com",
    web: "https://designlabnorth.com",
    available: [
      "Mark, colour fields, people stills, plates and office stills from this vault",
      `Introductions to ${pack.company.party} for comment`,
      "HyperTrack™ framing (SuccessFactors, S/4HANA, Concur)",
    ],
    legal: `${pack.company.name} enquiries: ${pack.company.email}`,
    disclaimer: PRESS_DISCLAIMER,
  },
};
