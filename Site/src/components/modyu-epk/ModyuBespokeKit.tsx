import "./modyu-epk.css";
import type { ReactElement } from "react";
import Link from "next/link";
import { EpkShell } from "@/components/modyu-epk/EpkShell";
import { EpkPlate } from "@/components/modyu-epk/EpkPlate";
import { CopyBlock } from "@/components/modyu-epk/CopyBlock";
import { EpkAssetTile } from "@/components/modyu-epk/EpkAssetTile";
import {
  aboutModyu,
  assetVault,
  boilerplate90,
  claimsQuote,
  claimsWeNeverMake,
  claimsWeStandBehind,
  contact,
  evidenceBlocks,
  faqs,
  fastFacts,
  follicleFiles,
  founderAngles,
  founderNarrative,
  founderTopics,
  ht4System,
  marketSource,
  marketStats,
  quoteBank,
  readyStories,
  shortIntro,
  storyHeadline,
  storySub,
  weCanSay,
  weNeverSay,
} from "@/lib/modyu-epk/content";
import {
  assetCategories,
  assetsByCategory,
} from "@/lib/modyu-epk/assets";

function Home() {
  return (
    <EpkShell>
      <EpkPlate
        linked
        src="/assets/people/ht4-people-hero.jpg"
        alt=""
        kicker="ModYu · HT4"
        title="Electronic Press Kit"
        lede="Stories, facts, quotes and assets — ready to lift into an article without the back-and-forth."
        columns={[
          {
            kicker: "01",
            title: "Stories ready to run",
            body: "Four desk-ready narratives with evidence hooks.",
            href: "/epk/modyu/stories",
          },
          {
            kicker: "02",
            title: "Ann-Marie [Founder]",
            body: "Biography, angles and interview topics.",
            href: "/epk/modyu/founder",
          },
          {
            kicker: "03",
            title: "The Follicle Files",
            body: "Living media channel for patient and clinician voices.",
            href: "/epk/modyu/follicle-files",
          },
          {
            kicker: "04",
            title: "Asset vault",
            body: "Logos, founder, product, campaigns.",
            href: "/epk/modyu/assets",
          },
        ]}
      />

      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <p className="epk-kicker">Boilerplate · ~90 words</p>
          <CopyBlock label="Standard boilerplate" text={boilerplate90} />
        </section>

        <section className="epk-panel">
          <p className="epk-kicker">Our story</p>
          <h2>{storyHeadline}</h2>
          <p className="epk-note" style={{ marginBottom: "0.75rem" }}>
            {storySub}
          </p>
          <CopyBlock label="Opening" text={shortIntro} />
          <p style={{ marginTop: "1rem" }}>
            <Link href="/epk/modyu/our-story" className="epk-btn">
              Full story
            </Link>
          </p>
        </section>

        <section>
          <p className="epk-kicker">Market context</p>
          <div className="epk-grid-3">
            {marketStats.map((s) => (
              <div key={s.value} className="epk-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="epk-note" style={{ marginTop: "0.75rem" }}>
            {marketSource}
          </p>
        </section>

        <section>
          <p className="epk-kicker">Stories ready to run</p>
          <div className="epk-grid-2">
            {readyStories.map((s) => (
              <Link
                key={s.slug}
                href={`/epk/modyu/stories#${s.slug}`}
                className="epk-tile"
              >
                <h3>{s.title}</h3>
                <p>{s.bestFor}</p>
              </Link>
            ))}
          </div>
        </section>

        <EpkPlate
          linked
          src="/assets/brand/ht4-system-banner.png"
          alt=""
          title="Asset vault"
          lede="We’ll supply interviews, imagery, samples, clinical summaries, patient case studies (with consent) and a surgeon to speak to."
          columns={assetVault.map((a) => ({
            title: a.title,
            body: a.note,
            href: a.href,
          }))}
        />
      </div>
    </EpkShell>
  );
}

function Assets() {
  return (
    <EpkShell eyebrow="Product & service" title="Asset vault">
      <div className="epk-stack">
        <p className="epk-note">
          Open or drag to save. Bottle and kit prices live on the{" "}
          <Link href="/epk/modyu/description">HT4 description</Link>.
        </p>
        {assetCategories.map((cat) => {
          const items = assetsByCategory(cat.id);
          if (!items.length) return null;
          return (
            <section key={cat.id} id={cat.id}>
              <div className="epk-asset-section__head">
                <div>
                  <p className="epk-kicker">{cat.title}</p>
                  <p className="epk-note">{cat.blurb}</p>
                </div>
              </div>
              <div className="epk-asset-grid">
                {items.map((asset) => (
                  <EpkAssetTile
                    key={asset.id}
                    asset={asset}
                    showRrp={cat.id === "bottles" || cat.id === "kits"}
                  />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </EpkShell>
  );
}

function Stories() {
  return (
    <EpkShell eyebrow="Product & service" title="Stories ready to run">
      <div className="epk-stack">
        <p className="epk-note">
          Each story is written for a journalist to lift. HT4 does not need to
          be the hero of paragraph one.
        </p>
        {readyStories.map((s) => {
          const pack = [
            s.title,
            "",
            s.story,
            "",
            `Why it matters now — ${s.whyNow}`,
            `Best for — ${s.bestFor}`,
            `Evidence & hook — ${s.evidence}`,
            `Ask us — ${s.askUs}`,
          ].join("\n");
          return (
            <article
              key={s.slug}
              id={s.slug}
              className="epk-panel epk-panel--white"
            >
              <p className="epk-kicker">Image cue · {s.imageHint}</p>
              <h2>{s.title}</h2>
              <CopyBlock label="Full story pack" text={pack}>
                <div className="epk-prose">
                  {s.story.split("\n\n").map((p) => (
                    <p key={p.slice(0, 40)}>{p}</p>
                  ))}
                </div>
                <h3>Why it matters now</h3>
                <p>{s.whyNow}</p>
                <h3>Best for</h3>
                <p>{s.bestFor}</p>
                <h3>Evidence &amp; hook</h3>
                <p>{s.evidence}</p>
                <h3>Ask us</h3>
                <p>{s.askUs}</p>
              </CopyBlock>
            </article>
          );
        })}
      </div>
    </EpkShell>
  );
}

function Founder() {
  const n = founderNarrative;
  return (
    <EpkShell eyebrow="Brand & background" title="Ann-Marie [Founder]">
      <EpkPlate
        src="/assets/lifestyle/about-modyu-portrait.png"
        alt="Ann-Marie Barlow, founder of ModYu"
        kicker="Founder story"
        title={n.headline}
        lede={n.punchline}
      />
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <div className="epk-quote">
            <p>“{n.quote}”</p>
            <cite>Ann-Marie Barlow, Founder</cite>
          </div>
          <CopyBlock label="Founder narrative" text={n.body} />
        </section>
        <section>
          <p className="epk-kicker">Lower-profile angles</p>
          <div className="epk-grid-2">
            {founderAngles.map((a) => (
              <article key={a.title} className="epk-panel">
                <p className="epk-note">{a.desk}</p>
                <h3>{a.title}</h3>
                <CopyBlock label="Angle" text={`${a.title}\n\n${a.body}`} />
              </article>
            ))}
          </div>
        </section>
        <section className="epk-panel epk-panel--white">
          <h2>What Ann-Marie can talk about</h2>
          <ul className="epk-list">
            {founderTopics.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
      </div>
    </EpkShell>
  );
}

function Quotes() {
  return (
    <EpkShell eyebrow="Brand & background" title="Quote bank">
      <div className="epk-stack">
        <p className="epk-note">
          All attributable to Ann-Marie Barlow, Founder of ModYu, and cleared
          for publication.
        </p>
        {quoteBank.map((group) => (
          <section key={group.topic} className="epk-panel epk-panel--white">
            <h2>{group.topic}</h2>
            <div className="epk-stack" style={{ marginTop: "0.75rem" }}>
              {group.quotes.map((q) => (
                <CopyBlock
                  key={q.slice(0, 40)}
                  label="Quote"
                  text={`“${q}” — Ann-Marie Barlow, Founder, ModYu`}
                >
                  <div className="epk-quote">
                    <p>“{q}”</p>
                    <cite>Ann-Marie Barlow, Founder</cite>
                  </div>
                </CopyBlock>
              ))}
            </div>
          </section>
        ))}
      </div>
    </EpkShell>
  );
}

function FollicleFiles() {
  const pack = [
    follicleFiles.intro,
    ...follicleFiles.why.map((w) => `${w.title}\n${w.body}`),
    ...follicleFiles.angles.map((a) => `${a.title}\n${a.body}`),
  ].join("\n\n");
  return (
    <EpkShell eyebrow="Brand & background" title="The Follicle Files">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <CopyBlock label="Overview" text={pack}>
            <p>{follicleFiles.intro}</p>
          </CopyBlock>
        </section>
        <div className="epk-grid-3">
          {follicleFiles.why.map((w) => (
            <article key={w.title} className="epk-panel">
              <h3>{w.title}</h3>
              <p>{w.body}</p>
            </article>
          ))}
        </div>
        <div className="epk-grid-2">
          {follicleFiles.angles.map((a) => (
            <article key={a.title} className="epk-tile">
              <h3>{a.title}</h3>
              <p>{a.body}</p>
            </article>
          ))}
        </div>
      </div>
    </EpkShell>
  );
}

function About() {
  return (
    <EpkShell eyebrow="Brand & background" title="About ModYu">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <p className="epk-kicker">{aboutModyu.line}</p>
          <CopyBlock
            label="About"
            text={`${aboutModyu.intro}

${aboutModyu.pitch}`}
          />
        </section>
        <section className="epk-grid-2">
          {aboutModyu.pillars.map((p) => (
            <article key={p.title} className="epk-panel">
              <h3>{p.title}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </section>
      </div>
    </EpkShell>
  );
}

function Facts() {
  const factsText = fastFacts.map((f) => `${f.label}: ${f.value}`).join("\n");
  const faqText = faqs.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n\n");
  return (
    <EpkShell eyebrow="Product & service" title="Fast facts & FAQ">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <h2>Fast facts</h2>
          <CopyBlock label="Fact sheet" text={factsText}>
            <div className="epk-grid-2">
              {fastFacts.map((f) => (
                <div key={f.label}>
                  <p className="epk-kicker">{f.label}</p>
                  <p>{f.value}</p>
                </div>
              ))}
            </div>
          </CopyBlock>
        </section>
        <section className="epk-panel">
          <h2>FAQ</h2>
          <CopyBlock label="FAQ" text={faqText}>
            {faqs.map((f) => (
              <div key={f.q} style={{ marginBottom: "1rem" }}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </div>
            ))}
          </CopyBlock>
        </section>
      </div>
    </EpkShell>
  );
}

function Contact() {
  const pack = [
    contact.name,
    contact.role,
    `Email: ${contact.email}`,
    `Web: ${contact.web}`,
    "",
    "Available on request:",
    ...contact.onRequest.map((x) => `• ${x}`),
    "",
    contact.legal,
  ].join("\n");
  return (
    <EpkShell eyebrow="Product & service" title="Contact">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <h2>Let’s help you tell the story</h2>
          <p style={{ marginBottom: "1rem" }}>
            For interviews, imagery, product samples, clinical summaries,
            patient case studies or a partner surgeon to speak to, get in
            touch. We aim to respond to media enquiries quickly.
          </p>
          <CopyBlock label="Contact block" text={pack}>
            <p>
              <strong>{contact.name}</strong>
              <br />
              {contact.role}
            </p>
            <p>
              Email: <a href={`mailto:${contact.email}`}>{contact.email}</a>
              <br />
              Web:{" "}
              <a href={contact.web} target="_blank" rel="noreferrer">
                {contact.web}
              </a>
            </p>
            <h3>Available on request</h3>
            <ul className="epk-list">
              {contact.onRequest.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
            <p className="epk-note" style={{ marginTop: "1rem" }}>
              {contact.legal}
            </p>
          </CopyBlock>
        </section>
      </div>
    </EpkShell>
  );
}

function Description() {
  const pack = [
    ht4System.intro,
    ...ht4System.phases.map((p) => `${p.name}\n${p.body}`),
    ht4System.closer,
  ].join("\n\n");
  return (
    <EpkShell eyebrow="HT4" title="The HT4 System Description">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <CopyBlock label="The HT4 system" text={pack}>
            <p>{ht4System.intro}</p>
          </CopyBlock>
        </section>
        <section className="epk-grid-2">
          {ht4System.phases.map((p) => (
            <article key={p.name} className="epk-panel">
              <h3>{p.name}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </section>
        <p className="epk-note">{ht4System.closer}</p>
      </div>
    </EpkShell>
  );
}

function Evidence() {
  return (
    <EpkShell eyebrow="HT4" title="The Evidence">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <CopyBlock
            label="Clinical evidence"
            text="HT4 rests on three complementary bodies of evidence, each doing a distinct job, plus independent testing of the products themselves. Stated plainly — and with the limits kept intact."
          >
            <p>
              HT4 rests on three complementary bodies of evidence, each doing a
              distinct job, plus independent testing of the products themselves.
              Stated plainly — and with the limits kept intact.
            </p>
          </CopyBlock>
        </section>
        {evidenceBlocks.map((b) => (
          <section key={b.title} className="epk-panel epk-panel--white">
            <h2>{b.title}</h2>
            <CopyBlock label={b.title} text={b.body} />
          </section>
        ))}
        <section className="epk-split">
          <div className="epk-split__yes">
            <h3>We can say</h3>
            <ul className="epk-list">
              {weCanSay.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="epk-split__no">
            <h3>We never say</h3>
            <ul className="epk-list">
              {weNeverSay.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </EpkShell>
  );
}

function Claims() {
  return (
    <EpkShell eyebrow="HT4" title="What we claim and what we don't">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <div className="epk-quote">
            <p>“{claimsQuote.text}”</p>
            <cite>{claimsQuote.attrib}</cite>
          </div>
          <CopyBlock
            label="Founder quote"
            text={`“${claimsQuote.text}” — ${claimsQuote.attrib}`}
          />
        </section>
        <section className="epk-split">
          <div className="epk-split__yes">
            <h3>Claims we stand behind</h3>
            <ul className="epk-list">
              {claimsWeStandBehind.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
          <div className="epk-split__no">
            <h3>Claims we deliberately never make</h3>
            <ul className="epk-list">
              {claimsWeNeverMake.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </EpkShell>
  );
}

function OurStory() {
  return (
    <EpkShell eyebrow="HT4" title="Our Story">
      <div className="epk-stack">
        <section className="epk-panel epk-panel--white">
          <h2>{storyHeadline}</h2>
          <p className="epk-note">{storySub}</p>
          <div style={{ marginTop: "1rem" }}>
            <CopyBlock label="Opening" text={shortIntro} />
          </div>
        </section>
        <section className="epk-panel">
          <h2>The surgery became an artform. The aftercare never did.</h2>
          <p>
            A global, billion-dollar procedure with no universally adopted
            standard for what happens after the operation.
          </p>
          <div className="epk-grid-3" style={{ marginTop: "1rem" }}>
            {marketStats.map((s) => (
              <div key={s.value} className="epk-stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div>
          <p className="epk-note" style={{ marginTop: "0.75rem" }}>
            {marketSource}
          </p>
        </section>
      </div>
    </EpkShell>
  );
}

const PAGES: Record<string, () => ReactElement> = {
  "": Home,
  stories: Stories,
  founder: Founder,
  quotes: Quotes,
  "follicle-files": FollicleFiles,
  "about-modyu": About,
  facts: Facts,
  assets: Assets,
  contact: Contact,
  description: Description,
  evidence: Evidence,
  claims: Claims,
  "our-story": OurStory,
  system: Description,
};

/** Bespoke ModYu press kit — same content as the former plot /epk. */
export function ModyuBespokeKit({ path }: { path: string[] }) {
  const key = (path[0] || "").toLowerCase();
  const Page = PAGES[key];
  if (!Page) {
    return (
      <EpkShell title="Not found">
        <p className="epk-note">
          That press page is not in this kit.{" "}
          <Link href="/epk/modyu">Back to the ModYu EPK</Link>
        </p>
      </EpkShell>
    );
  }
  return <Page />;
}
