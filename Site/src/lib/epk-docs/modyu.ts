import { PRESS_DISCLAIMER } from "@/lib/epk-copy";
import type { EpkDoc } from "@/lib/epk-doc";

export const modyuDoc: EpkDoc = {
  kit: "modyu",
  product: "HT4™",
  kitTitle: "Electronic Press Kit",
  peopleLine: "Ann-Marie · HT4 · Follicle Files",
  coverNote:
    "We’ll supply interviews, imagery, samples, clinical summaries, patient case studies (with consent) and a surgeon to speak to.",
  coverLabels: ["Our story", "The evidence", "What we claim — and what we won’t"],
  lanes: [
    { id: "logos", label: "Logos" },
    { id: "product", label: "Product" },
    { id: "founder", label: "Founder" },
    { id: "campaigns", label: "Campaigns" },
  ],
  nav: [
    { href: "#stories", label: "Stories ready to run" },
    { href: "#founder", label: "Ann-Marie [Founder]" },
    { href: "#about", label: "ModYu™" },
    { href: "#follicle", label: "The Follicle Files" },
    { href: "#quotes", label: "Quote bank" },
    { href: "#facts", label: "Fast facts & FAQ" },
    { href: "#assets", label: "Asset Vault", sub: ["Logos", "Founder", "Products", "Campaigns"] },
    { href: "#contact", label: "Contact" },
  ],
  story: {
    title: "Our Story",
    paras: [
      "We are ModYu, a small British company behind HT4 a clinic-led, four-phase aftercare system designed specifically for people having hair transplant surgery.",
      "But the reason we think you’ll be interested has very little to do with our bottles and everything to do with a gap almost nobody is talking about.",
      "Hair transplant surgery has become one of the fastest-growing cosmetic procedures in the world, and the techniques have been refined again and again. Yet the care that begins the moment a patient walks out of the clinic has never been standardised in the same way, and there is still no single, universally agreed approach to it.",
    ],
    boilerplate: {
      heading: "HT4 is a clinic-led, four-phase aftercare system designed specifically for people undergoing hair transplant surgery.",
      paras: [
        "ModYu is a British company on a mission to improve the quality, consistency and confidence of hair transplant aftercare. It is not a cosmetics brand or a clinic, but a company built on one belief: patients deserve the same standard of care after surgery as they receive during it. Its HT4 system is a clinic-led, four-phase aftercare programme — Prepare, Protect, Recover and Continue — designed around how the scalp’s needs genuinely change before, during and after a transplant. HT4 supports a clinic’s own protocol; it never replaces the surgeon’s advice.",
      ],
    },
  },
  storyCont: {
    line: "The surgery became an artform. The aftercare never did.",
    sub: "A global, billion-dollar procedure with no universally adopted standard for what happens after the operation. The surgery has been redesigned from first principles, more than once.",
    facts: [
      {
        value: "~$4.5bn",
        label: "Estimated value of the global hair-restoration surgery market in 2021.",
      },
      {
        value: "~628,600",
        label:
          "Hair-transplant procedures the ISHRS estimated were performed worldwide in 2021 — the most recent year it published a global total.",
      },
      {
        value: "85%/15%",
        label:
          "Male-to-female split of surgical patients in 2024 (84.7% / 15.3%), with the female share up from 12.7% in 2021.",
      },
      {
        value: "91.7%",
        label: "Share of donor grafts taken from the scalp, with FUE now the dominant harvesting method.",
      },
      {
        value: "No.1",
        label:
          "The most common reason patients gave for surgery was “to feel more attractive”; 44% said they planned to tell others they’d had a transplant.",
      },
    ],
    source: "Source: ISHRS 2025 Practice Census",
  },
  pitches: [
    {
      id: "surgery",
      kicker: "Hair transplant head wounds",
      title: "A Hair Transplant Is Surgery. Why Don’t We Treat the Recovery Like It Is?",
      question: "You’ve just had hair transplant surgery. What should actually go on your scalp for the first 48 hours?",
      story: [
        "Hair transplantation is surgery — a hairline built from thousands of individually placed grafts, which means thousands of tiny wounds. Yet the first 48 hours, when the scalp is most vulnerable, are the least standardised part of the whole journey. In its surgical-site guidance, NICE says plainly: “Use sterile saline for wound cleansing up to 48 hours after surgery.” But that guidance (dating from 2008) addresses surgical wounds in general and does not specifically cover hair transplantation — and what patients are actually handed varies widely, from sterile saline to baby shampoo. That gap is the story.",
      ],
      illustration: [
        "Patients crowdsource the most serious questions — whether they’re a candidate from a selfie, whether to take a prescription drug, how many grafts — from strangers in Facebook groups rather than a clinician. That behaviour is the clearest proof the public has stopped treating this as surgery. The forum is the symptom, not the patient’s failing.",
      ],
      whyNow:
        "Procedure volumes are rising and more first-time patients are recovering at home, yet the very first window — when the scalp is most vulnerable — is the least standardised part of the pathway.",
      bestFor: "Health and consumer-health desks. This is genuine service journalism, and HT4 need not be the hero of paragraph one.",
      evidence:
        "The wound-healing principle: Dr Sara Wasserbauer, hair transplant surgeon, writing in the ISHRS journal (2012) — optimal wound moisture balance is fundamental to healing. The surgery standard: NICE guideline NG125 (2008), whose recommendation is “use sterile saline for wound cleansing up to 48 hours after surgery” — general guidance that isn’t hair-transplant-specific. The anchoring map: Bernstein & Rassman (Dermatologic Surgery, 2006) quantified when grafts secure and noted prior post-op advice had been “somewhat arbitrary” — the day-by-day map HT4’s phases are timed around, and a study that, nearly 20 years on, still hasn’t been built into a standard. Finasteride is a live safety story the reporter can bring in independently (the MHRA has strengthened its warnings) — which is precisely why these are clinician decisions, not forum ones. ModYu doesn’t weigh in on the drug itself.",
      ask: "We’ll walk you through exactly what the guidance says — and what it doesn’t — and provide the evidence.",
    },
    {
      id: "artform",
      kicker: "Surgery to salt water",
      title: "The Surgery Became an Artform. The Aftercare Never Did.",
      story: [
        "The master framing. Surgeons now work at an extraordinary level of craft — individual follicular units, designed hairlines, angle and density and direction, donor management, planning for future hair loss. Then the patient goes home to advice that was never designed as a connected system. Until now — which is where ModYu enters, without the headline becoming an advert.",
      ],
      whyNow:
        "Cross-border transplant tourism and rising volumes mean more patients than ever recovering with inconsistent guidance. The peg that ties every other story together (see the numbers on Our Story).",
      bestFor: "Features, business and national desks.",
      evidence:
        "ISHRS 2025 Practice Census — FUE the dominant harvesting method, 91.7% of donor grafts from the scalp. HT4’s four phases are the payoff: not “more products”, but the first time the whole journey has been designed as one connected system.",
      ask: "“Why has aftercare lagged so far behind the surgery itself?” Put it to our founder — and, where possible, a partner surgeon.",
    },
    {
      id: "shampoo",
      kicker: "Miracle shampoos",
      title: "Your Shampoo Won’t Grow Your Hair. It’s Time Someone Said So.",
      story: [
        "The hair-loss market runs on promises — rosemary, caffeine, “miracle” shampoos. ModYu takes the opposite position: be clear about what scalp care genuinely can do, and equally clear about what it can’t. As the founder puts it: “We can’t make your hair grow. We can take scalp care seriously.”",
      ],
      whyNow:
        "Consumers are increasingly sceptical of cosmetic over-claiming, and regulators scrutinise it. A brand built on restraint is a contrarian, trust-led story.",
      bestFor: "Features, consumer-affairs and business desks.",
      evidence:
        "ModYu’s own claims page — no claims of growth, hair-loss prevention, transplant success, infection prevention or graft survival. That published restraint is what makes the position credible rather than contrarian for its own sake.",
      ask: "“Why build a brand around what your product can’t do?”",
    },
    {
      id: "weeks",
      kicker: "Shock and itch — the days and weeks post transplant",
      title: "The Most Planned Day of Your Life. The Least Planned Weeks.",
      story: [
        "A patient spends months choosing a surgeon, studies before-and-afters, compares techniques, often travels abroad, and pays a great deal. Then comes the longest part of the journey — going home to recover — and almost none of that planning energy follows them there.",
      ],
      whyNow:
        "A wave of first-time patients researches recovery online and finds conflicting, sometimes alarming, advice. The lived experience behind the standards gap.",
      bestFor:
        "Consumer and lifestyle press. Strong first-person potential — we can help you find a willing patient case study and a clinician to comment.",
      evidence:
        "Ann-Marie’s first-hand experience of the questions patients ask after surgery, and the founder’s account of why the first 72 hours became their own dedicated phase in HT4.",
      ask: "Follow one patient through the first ten days. We can make introductions, with consent.",
    },
  ],
  founder: {
    kicker: "A hairdresser’s story",
    title: "The hairdresser who asked what happens after the surgery",
    pull: "I didn’t set out to make another shampoo. I set out to answer a question I couldn’t let go of.",
    paras: [
      "Ann-Marie Barlow didn’t arrive at hair care as an entrepreneur looking for a gap in a growing market. She grew up in a family of hairdressers and worked in the industry, and where others were drawn to styling she was always more interested in what was happening underneath — the scalp, the biology, the reasons hair changed.",
      "She trained through Trevor Sorbie’s renowned My New Hair programme, fitting wigs and hair solutions for people living with alopecia and cancer, and for members of the transgender community. These were people whose relationship with their hair went far deeper than how it looked, and every one of them taught her the same lesson: hair is rarely the problem on its own, and understanding the reason underneath it is where good care starts.",
      "Then she noticed something. Early in her career she met a man who had received a hair transplant at eighteen. By the time they met he was in his mid-forties, and decades of natural hair loss had left those original grafts stranded along an exposed hairline. It wasn’t anyone’s fault — but it planted a question that never left her: as this surgery keeps improving, what is happening to the care that surrounds it?",
      "She wasn’t looking for a product to invent. She had found a problem she couldn’t stop thinking about. She immersed herself in scalp biology, ingredients and the real patient journey, and kept reaching the same conclusion: surgical technique had advanced enormously; aftercare hadn’t kept pace.",
      "Some of what she saw simply didn’t add up. As a hairdresser she’d reached for baby shampoo to lift colour out of hair — so when she found it being recommended to wash a freshly operated scalp, she couldn’t understand it: gentle enough for a baby’s eyes is not the same as right for a healing adult scalp, whose naturally acidic surface baby shampoo isn’t formulated to match. Small things like that convinced her the aftercare had been handed down rather than designed.",
      "When she designed HT4, she didn’t guess at the timings. She built the phases around the published science of graft anchoring — mapping the system to the days on which the scalp is most vulnerable and then progressively more secure — and she made sure the Phase 2 cleanse was properly made sterile and regulated as a medical device, the standard that applies the moment something is used on the broken skin of a healing scalp. That instinct — to check rather than assume — runs through the whole company.",
    ],
    sidebar: {
      title: "A woman redefining an industry built for men, by men.",
      paras: [
        "Ann-Marie enters a room where 85% of the patients are men, the majority of top surgeons are men, and the marketing is aggressively tailored to male insecurity. As a female stylist trained in Trevor Sorbie’s empathetic My New Hair programme, she brings a completely different energy. She views hair loss not as a commercial transaction, but as a deeply vulnerable identity crisis.",
        "While the men in the industry were busy obsessing over the mechanics of the surgery, a woman had to step in to figure out how to actually take care of the patient when they got home.",
      ],
    },
    talksHeading: "What Ann-Marie can talk about",
    talksIntro:
      "Journalists don’t only need company information — they need sources. Ann-Marie is available for comment, background and interview, including on stories that aren’t about HT4 at all. She can speak knowledgeably on:",
    talks: [
      "Hair-transplant aftercare, and what good recovery care actually involves",
      "Scalp care before and after transplantation",
      "What patients should ask their clinic about aftercare",
      "Common misconceptions about post-transplant scalp care",
      "Ingredients and scalp-product formulation",
      "Responsible claims in the hair-loss industry",
      "The patient experience around hair loss, from wigs to restoration",
      "Building a specialist British hair- and scalp-care business",
    ],
    talksNote: "To arrange a comment or interview, see Contact. We aim to respond to media enquiries quickly.",
  },
  extras: {
    intro:
      "Lower-profile than the four main arguments, but each is a real piece we can support with evidence, quotes and interviews.",
    items: [
      {
        desks: "Consumer, beauty and science desks",
        title: "Why is baby shampoo the standard advice after surgery?",
        body: [
          "A hairdresser’s-eye question with real science behind it. A healthy adult scalp sits at a slightly acidic pH of about 4.5–5.5 — its protective ‘acid mantle’ — while many baby shampoos are formulated close to neutral (around pH 7) to be tear-free, and are designed to lift light infant oils rather than adult sebum and post-operative crusting. ‘Gentle’ isn’t the same as ‘designed for a healing scalp’.",
          "We raise it as a question, and always defer to the clinic’s own instructions.",
        ],
      },
      {
        desks: "Consumer-affairs and trade press",
        title: "The transplant-tourism aftercare gap",
        body: [
          "Large numbers of UK and European patients travel abroad for surgery, then fly home to recover with little continuity of care once they’ve left the operating country. What happens to your aftercare when your surgeon is two thousand miles away?",
          "Framed as a systemic gap, not a criticism of any clinic.",
        ],
      },
      {
        desks: "Consumer and lifestyle desks",
        title: "The questions nobody prepares hair-transplant patients to ask",
        body: [
          "Is this itching normal? When can I wash? What can I touch? What’s actually expected in those first few days? A practical, reassuring service piece that gives readers the information the consultation often doesn’t — built around clarity, not any claim of how a product makes patients feel.",
        ],
      },
      {
        desks: "Health and science media",
        title: "What the science actually supports",
        body: [
          "Several HT4 formulations underwent independent dermatological testing (HRIPT with challenge) on 54 sensitive-skin volunteers, returning zero irritation and zero allergic reactions; the overnight serum was assessed as non-comedogenic. Substance beneath the claims, with the caveats intact.",
        ],
      },
      {
        desks: "Trade, business and start-up media",
        title: "The clinic economics of aftercare",
        body: [
          "A young British company with a B2B model built to help clinics offer a consistent aftercare standard. The programme is designed to reduce avoidable post-op queries and simplify what teams recommend — propositions we’re now working to evidence with partner clinics, rather than outcomes we’ve already measured.",
          "HT4 launched at the ISHRS World Congress in Berlin, with a clinic pipeline forming across Spain, the Netherlands, Brazil and Mexico.",
        ],
      },
    ],
  },
  system: {
    title: "The HT4 system",
    intro: [
      "HT4 organises care by patient need, not product type. It follows one connected journey — Prepare, Protect, Recover, Continue — across four phases, because a healing scalp needs different things at different stages and no single product can respond to all of them. The phase timings are built around the published science of when grafts progress from vulnerable to secure.",
    ],
    phases: [
      {
        title: "Phase 1 · Balance — Prepare",
        body: "Used in roughly the thirty days before surgery. A gentle daily shampoo whose real purpose is preparation: arriving at the procedure with a calm, clean, comfortable scalp, and with the patient already feeling engaged and in control.",
      },
      {
        title: "Phase 2 · Cleanse — Protect",
        body: "The first days after surgery, when the priority is simply to follow the clinic’s instructions. A sterile, CE-marked saline wound-cleanse, delivered as a fine mist that can be applied from any angle without touching the scalp, and sterile from the first spray to the last. Its early, frequent, gentle use is aligned with the principle that minimising crust supports a cleaner passage through the days grafts are most vulnerable.",
      },
      {
        title: "Phase 3 · Hydrate, Bathe & Comfort — Recover",
        body: "Three products because early recovery has three distinct needs: a moisture-balancing Hydrate spray, a light Bathe cleansing foam that lifts debris without rubbing, and an overnight Comfort serum for soothing and nourishment. They work together, never as alternatives.",
      },
      {
        title: "Phase 4 · Protect & Nourish — Continue",
        body: "Recovery doesn’t end when the visible signs fade. A shampoo and conditioner for long-term scalp and hair care that carry the healthy habits of recovery into everyday life. A transplant is one day; looking after your scalp is for life.",
      },
    ],
    close: "Four phases. One connected system.",
  },
  evidence: {
    title: "Clinical evidence",
    intro:
      "HT4 rests on three complementary bodies of evidence, each doing a distinct job, plus independent testing of the products themselves. Stated plainly — and with the limits kept intact.",
    blocks: [
      {
        title: "The wound-healing principle",
        body: "Dr Sara Wasserbauer, a hair transplant surgeon, set out the wound-healing case in the ISHRS’s own journal (2012): achieving optimal wound moisture balance is fundamental to healing — too wet and a wound macerates, too dry and repair is impeded. This is the clinical principle HT4’s moisture-balancing phases are built to support. We cite her published work with attribution; it does not imply any endorsement of HT4.",
      },
      {
        title: "The surgical standard",
        body: "NICE guideline NG125 puts it plainly: “Use sterile saline for wound cleansing up to 48 hours after surgery” (recommendation dated 2008). It is general surgical-site guidance and does not specifically address hair transplantation — which is exactly why the first-48-hours question is worth asking, and why the advice patients actually receive (from sterile saline to baby shampoo) varies so much.",
      },
      {
        title: "The graft-anchoring map",
        body: "Bernstein & Rassman (Dermatologic Surgery, 2006) provided the first scientific answer to when transplanted grafts become securely anchored — vulnerable in the first days, progressively secure over the following week or so — and observed that prior post-op advice had been “somewhat arbitrary.” HT4’s phase timings are built around that map. Nearly two decades on, it remains a reference point, and the standard it invited still hasn’t been widely adopted.",
      },
      {
        title: "Independent product testing",
        body: "HRIPT with challenge, at an independent laboratory, on 54 adults with self-declared sensitive skin (Fitzpatrick II–IV), early 2025: zero irritation and zero allergic reactions — supporting “clinically proven to be hypoallergenic” and “dermatologically tested for very good skin compatibility.” Non-comedogenic (Comfort Night Serum): a separate independent study — 22 subjects with dry or itchy scalps, 28 days’ daily use — recorded no significant increase in comedones, supporting “clinically proven to be non-comedogenic.” Sterile, and regulated as a medical device: because it is used on the broken skin of a healing scalp, the Phase 2 cleanse is held to a medical-device standard — sterile and CE-marked — which is exactly what HT4 built it to be. It is the same sterile-saline standard NICE advises for the first 48 hours after surgery, met in full.",
      },
    ],
    canSay: [
      "The phases are timed around the known graft-anchoring window",
      "HT4’s early, gentle cleansing aligns with the crust-minimisation principle",
      "The products are independently tested and dermatologically assessed",
      "HT4 supports the clinic’s protocol",
    ],
    neverSay: [
      "HT4 grows hair or thickens existing hair",
      "HT4 prevents or reverses hair loss",
      "HT4 secures grafts, guarantees survival or prevents infection",
      "HT4 speeds healing or guarantees a transplant’s success",
    ],
  },
  claims: {
    title: "Responsible claims",
    intro: [
      "Being straight about the limits of our products is a core part of what ModYu stands for. It’s also, we think, why the rest of what we say can be trusted.",
    ],
    stand: [
      "Clinically proven to be hypoallergenic (tested Phase 3 formulations).",
      "Dermatologically tested for very good skin compatibility.",
      "Zero allergic reactions in a clinical trial of sensitive-skin users.",
      "Clinically proven to be non-comedogenic (Comfort Night Serum).",
      "A sterile, CE-marked medical-device wound cleanse for the first days after surgery.",
    ],
    never: [
      "We do not claim HT4 grows hair or thickens existing hair.",
      "We do not claim it prevents or reverses hair loss.",
      "We do not claim it secures grafts, guarantees survival, prevents infection or guarantees a transplant’s success.",
      "We never position HT4 as a replacement for a surgeon’s advice. It supports a clinic’s protocol; it never overrides it.",
    ],
    quote: {
      text: "The hair loss industry is full of ever-bigger promises. I’d rather HT4 be known for the opposite — telling patients honestly what our products can do, and what they can’t.",
      cite: "Ann-Marie Barlow, Founder",
    },
    note: "Please attribute testing to the independent laboratories, and the wound-healing and anchoring science to the authors and journals named. Full study summaries are available to accredited media on request, and we’re happy to have a scientific summary fact-checked before you publish.",
  },
  quoteBank: [
    {
      heading: "The industry",
      quotes: [
        {
          text: "The surgery has been redesigned from first principles, over and over. For years, the aftercare was the part nobody had gone back and designed properly.",
        },
        {
          text: "The surgery keeps getting more medical. The way we talk about it keeps getting less.",
        },
        {
          text: "As a hairdresser, I’d reached for baby shampoo to lift colour out of hair. So I could never quite understand how it became the thing we put on a healing scalp. Gentle isn’t the same as right.",
        },
      ],
    },
    {
      heading: "On patients",
      quotes: [
        {
          text: "The first seventy-two hours at home are when patients are most anxious and most alone. That’s exactly when the guidance has tended to be weakest.",
        },
        {
          text: "It still amazes me that someone will spend a fortnight reading a Facebook thread before their surgery, but won’t put the same question to the surgeon. That isn’t the patient’s failing — it’s a sign of how casual we’ve all let this feel. It’s surgery. Those questions deserve a professional, not a poll.",
        },
        { text: "We can’t make your hair grow. We can take scalp care seriously." },
        { text: "A transplant is one day. Looking after your scalp is for life." },
      ],
    },
    {
      heading: "The founder story",
      quotes: [
        { text: "I didn’t set out to make another shampoo. I set out to answer a question I couldn’t let go of." },
        { text: "I wasn’t looking for a product to invent. I found a problem I couldn’t stop thinking about." },
        {
          text: "I grew up on the salon floor, and that’s where I learned that hair care is never just superficial. It is an emotional, deeply personal journey. When you look after your hair, you are looking after your life.",
        },
      ],
    },
    {
      heading: "The science",
      quotes: [
        { text: "I didn’t guess at the timings. I built the phases around the published science of when grafts anchor." },
        {
          text: "We only promise what we genuinely believe our products can do. Claiming less is what makes everything else we say believable.",
        },
      ],
    },
    {
      heading: "Clinics",
      quotes: [
        {
          text: "The surgeon is always in charge. We’re there to support the recovery, never to replace their judgement.",
        },
        {
          text: "This was never about selling clinics a product. It was about giving them a consistent standard to hand their patients.",
        },
      ],
    },
    {
      heading: "The salon",
      quotes: [
        {
          text: "Wellbeing and style are completely interconnected — a healthy lifestyle reflects in healthier hair, and the salon is where that confidence is brought to life.",
        },
        {
          text: "The salon isn’t just a place you go for a trim; it’s a space of transformation, community, and ultimate client care. I wanted ModYu to capture that exact feeling — that uncompromising attention to detail and dedicated focus on the individual, making people feel entirely good about themselves from the scalp up.",
        },
        {
          text: "Hair transplantation is where surgery meets artistry, but the hair world has always been driven by incredible craftspeople.",
        },
      ],
    },
  ],
  facts: {
    heading: "Fast facts",
    rows: [
      { label: "Company", value: "modYu Limited trading as HT4. Registered in England and Wales." },
      { label: "Founder", value: "Ann-Marie Barlow" },
      { label: "Product", value: "HT4 — a clinic-led, four-phase hair transplant aftercare system" },
      { label: "Structure", value: "4 phases: Prepare, Protect, Recover, Continue" },
      { label: "Development", value: "Around three years of formulation, lab and dermatological work" },
      { label: "Testing", value: "Independent HRIPT · non-comedogenic · CE-marked medical-device" },
      { label: "Designed around", value: "The published science of graft anchoring and wound-healing moisture balance" },
      { label: "Launched", value: "ISHRS World Congress, Berlin" },
      { label: "Pipeline", value: "Clinic interest across Spain, the Netherlands, Brazil and Mexico" },
      { label: "Model", value: "B2B Clinic Partner Programme" },
      { label: "Website", value: "modyu.com" },
    ],
  },
  faqs: [
    {
      q: "What does HT4 stand for?",
      a: "The four phases of the system: Balance (before surgery), Cleanse (the first days after), the three-part Recover phase (Hydrate, Bathe, Comfort), and Protect & Nourish for long-term care.",
    },
    {
      q: "Is it sold instead of the clinic’s own advice?",
      a: "No. HT4 is designed to work alongside a clinic’s protocol, never to replace it. Patients always follow their surgeon’s guidance first.",
    },
    {
      q: "Why four phases instead of one product?",
      a: "Because recovery is a process, not an event. The scalp needs different things before surgery, immediately after, during early healing and long-term — and no single product covers all of that.",
    },
    {
      q: "Isn’t the Phase 2 cleanse just the saline clinics already use?",
      a: "It’s sterile 0.9% saline, but assessed and classified as a CE-marked medical device and delivered through a sealed system that stays sterile to the last spray. We describe the difference without overstating what saline can do.",
    },
    {
      q: "Does it help hair grow?",
      a: "No, and we never claim it does. HT4 supports the comfort, cleanliness and condition of the scalp through recovery and beyond. Growth is a matter of the surgery and the patient’s own biology.",
    },
  ],
  about: {
    title: "ModYu™",
    kicker: "For Hair. For Life.",
    paras: [
      "ModYu is a modern hair and wellness brand built around a single line: “For Hair. For Life.” It is an ecosystem that treats hair care not as a superficial beauty routine, but as a deeply personal, lifetime journey of confidence and self-worth.",
    ],
    pillars: [
      {
        title: "The whole hair experience",
        body: "ModYu views hair through a holistic lens where wellbeing and style are entirely interconnected. Hair health does not exist in a vacuum; a healthy, balanced lifestyle is the foundation of vibrant hair, and ModYu champions both as one complete experience.",
      },
      {
        title: "The passion for the salon",
        body: "Deeply rooted in the energy, community, and transformative power of the salon floor. ModYu is fiercely passionate about the professional salon environment, where hair care meets personal connection.",
      },
      {
        title: "Creativity and craftspersonship",
        body: "Built on a profound respect for the artistry of hair. From meticulous product formulation to the fine details of styling, ModYu celebrates the dedication, skill, and creative spark of true craftspeople.",
      },
      {
        title: "The ultimate standard of client care",
        body: "Obsessed with the finer details. ModYu brings an uncompromising level of attention, luxury, and personalised care to the individual, ensuring everyone is empowered to live life feeling completely good about themselves.",
      },
    ],
    pitch:
      "For lifestyle, beauty, and wellness editors, ModYu offers a fresh, positive voice. It bridges the gap between clinical scalp care and high-end salon artistry, proving that looking after your hair is one of the most powerful ways to look after your life.",
  },
  satellite: {
    title: "The Follicle Files",
    paras: [
      "The Follicle Files is a rapidly growing social media channel running alongside ModYu and HT4’s core digital presence. Far from standard brand content, it is designed as an interactive, multi-platform media asset — a source of raw insights, authentic human stories, and expert authority.",
      "Journalists looking for real-time consumer trends, authentic voices, and expert commentary can use The Follicle Files as an editorial shortcut.",
    ],
    bullets: [
      {
        title: "Unfiltered patient journeys",
        body: "Deep, real-time engagement with real people navigating hair restoration. It captures the raw emotional reality, the vulnerability of surgery, and the psychological shift of reclaiming self-image.",
      },
      {
        title: "The expert collective",
        body: "Direct, straight-talking interviews with leading surgeons, clinicians, and industry insiders who pull back the curtain on the hair transplant sector.",
      },
      {
        title: "The lifestyle evolution",
        body: "A channel constantly expanding its horizons. While rooted in the transplant sector, the content is actively broadening into the wider world of hair health, professional styling, and modern salon culture.",
      },
      {
        title: "The real-time trend tracker",
        body: "Tap into the live conversations, anxieties, and triumphs of a highly engaged community to spot shifting consumer behaviours before they hit the mainstream.",
      },
      {
        title: "The authority rolodex",
        body: "A curated roster of clinicians and patients who are prepared and comfortable speaking to the media.",
      },
    ],
  },
  contact: {
    name: "Ann-Marie Barlow",
    role: "Founder, ModYu Ltd (HT4)",
    email: "annmarie.barlow@modyu.com",
    web: "https://modyu.com",
    available: [
      "Independent clinical / dermatological test summaries",
      "Patient case studies (where available and with consent)",
      "Interviews with the founder and, where possible, partner surgeons",
      "Product samples for review",
      "Bespoke quotes and data tailored to your angle",
    ],
    legal: "ModYu Ltd (trading as HT4) · Registered in England & Wales · modyu.com",
    disclaimer:
      "This pack is for editorial use. Please keep product claims to those listed and attribute testing and cited research to the sources named. Hosted by Design Lab North. " +
      PRESS_DISCLAIMER,
  },
};

modyuDoc.quoteBank.forEach((group) => {
  group.quotes.forEach((q) => {
    if (!q.cite) q.cite = "Ann-Marie Barlow, Founder of ModYu. Cleared for publication.";
  });
});
