"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { isImageHref, isPdfHref, isShared } from "@/lib/assets-view";
import { firstBanner, firstLogo } from "@/lib/epk-cover";
import { liveStories, type KitContent, type EpkStory } from "@/lib/epk-content-model";
import type { EpkDoc, EpkPitch } from "@/lib/epk-doc";
import { extraCampaigns, isModyuPage, modyuNav, pageHref, pageTitle, type ModyuPageId } from "@/lib/modyu-kit";
import { SECTION_LABEL, sectionItems, type EpkSection } from "@/lib/epk-sections";
import type { AssetItem } from "@/lib/assets";

function Still({ href, title }: { href: string; title: string }) {
  if (isImageHref(href)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={href} alt="" />
    );
  }
  return (
    <span className="assets-file">
      <span className="kicker">{isPdfHref(href) ? "PDF" : "File"}</span>
      <strong>{title}</strong>
    </span>
  );
}

export function ModyuKitApp({
  doc,
  items,
  content,
  path,
  studio,
  tagged,
}: {
  doc: EpkDoc;
  items: AssetItem[];
  content: KitContent;
  path: string[];
  studio?: boolean;
  tagged?: boolean;
}) {
  const pack = items.filter(isShared);
  const logos = isShown(content, "logos") ? sectionItems(pack, "logos") : [];
  const banners = isShown(content, "banners") ? sectionItems(pack, "banners") : [];
  const people = isShown(content, "people") ? sectionItems(pack, "people") : [];
  const files = isShown(content, "files") ? sectionItems(pack, "files") : [];
  const extras = extraCampaigns(liveStories(content));
  const logo = firstLogo(pack);
  const banner = firstBanner(pack);
  const section = path[0] || "";
  const id = path[1] || "";
  const print = path[1] === "print" || path[2] === "print";
  const pitch = doc.pitches.find((row) => row.id === id);
  const extra = extras.find((row) => row.id === id);
  const pageId: ModyuPageId =
    !section || section === "overview"
      ? "home"
      : section === "logos" || section === "banners" || section === "people" || section === "files"
        ? "vault"
        : isModyuPage(section)
          ? section
          : "home";
  const campaignPrint = section === "campaigns" && print && (pitch || extra);
  const pagePrint = print && pageId !== "home" && pageId !== "campaigns" && pageId !== "vault" && !pitch;

  useEffect(() => {
    if (!studio && !tagged) return;
    fetch("/api/epk/stamp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit: "modyu" }),
    }).catch(() => {});
  }, [studio, tagged]);

  function leave() {
    if (tagged) window.location.href = "/account";
    else if (studio) window.location.href = "/epk";
    else {
      fetch("/api/epk/leave", { method: "POST", credentials: "include" }).then(() => {
        window.location.href = "/epk";
      });
    }
  }

  if (campaignPrint && (pitch || extra)) {
    return (
      <PrintSheet
        back={pageHref(pitch ? `campaigns/${pitch.id}` : `campaigns/${extra?.id}`)}
        title={pitch?.title || extra?.title || ""}
        logo={logo?.href}
        banner={banner?.href}
      >
        {pitch ? <PitchBody pitch={pitch} /> : extra ? <StoryBody story={extra} /> : null}
      </PrintSheet>
    );
  }

  if (pagePrint) {
    return (
      <PrintSheet
        back={pageHref(pageId)}
        title={pageTitle(doc, pageId)}
        logo={logo?.href}
        banner={banner?.href}
      >
        <DocBody doc={doc} page={pageId} extras={extras} />
      </PrintSheet>
    );
  }

  const current =
    section === "campaigns" && id
      ? ""
      : pageId === "home"
        ? ""
        : pageHref(pageId);

  return (
    <div className="epk epk-map epk-modyu">
      <header className="epk-map__bar">
        <Link className="epk-map__kit" href={pageHref()}>
          <strong>{doc.product}</strong>
          <span>{doc.kitTitle}</span>
        </Link>
        <Link className="epk-map__word" href={pageHref()}>
          {doc.product}
        </Link>
        <div className="epk-map__marks">
          <Link className="epk-contact-btn chamfer" href={pageHref("contact")}>
            Contact
          </Link>
        </div>
      </header>
      <div className="epk-map__body">
        <aside className="epk-rail chamfer">
          {modyuNav().map((group) => (
            <p key={group.title} className="epk-rail__group">
              <span>{group.title}</span>
              {group.items.map((row) => (
                <Link
                  key={row.href}
                  href={row.href}
                  aria-current={current === row.href || (pageId === row.id && !id) ? "page" : undefined}
                >
                  {row.label}
                </Link>
              ))}
            </p>
          ))}
          <p className="epk-rail__foot">
            {studio ? <Link href="/epk">Kits</Link> : null}
            {tagged ? <Link href="/account">Account</Link> : null}
            {studio || tagged ? (
              <Link href={tagged ? "/account?view=assets" : "/account?desk=assets"}>Assets</Link>
            ) : (
              <button type="button" className="assets-text-btn" onClick={leave}>
                Leave
              </button>
            )}
          </p>
        </aside>
        <div className="epk-map__main">
          {pageId === "home" ? (
            <Home doc={doc} extras={extras} />
          ) : section === "campaigns" && pitch ? (
            <ArticleShell
              kicker="Stories ready to run"
              kickerHref={pageHref("campaigns")}
              title={pitch.title}
              pdfHref={pageHref(`campaigns/${pitch.id}/print`)}
            >
              <PitchBody pitch={pitch} />
            </ArticleShell>
          ) : section === "campaigns" && extra ? (
            <ArticleShell
              kicker="Stories ready to run"
              kickerHref={pageHref("campaigns")}
              title={extra.title}
              pdfHref={pageHref(`campaigns/${extra.id}/print`)}
            >
              <StoryBody story={extra} />
            </ArticleShell>
          ) : pageId === "campaigns" ? (
            <CampaignIndex doc={doc} extras={extras} />
          ) : pageId === "vault" ? (
            <Vault logos={logos} banners={banners} people={people} files={files} />
          ) : (
            <ArticleShell
              kicker={railKicker(pageId)}
              kickerHref={pageHref(pageId)}
              title={pageTitle(doc, pageId)}
              pdfHref={pageHref(`${pageId}/print`)}
            >
              <DocBody doc={doc} page={pageId} extras={extras} />
            </ArticleShell>
          )}
        </div>
      </div>
      <p className="epk-map__host">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="is-paper" src="/brand/dln-mute.png" alt="" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="is-ink" src="/brand/dln-white.png" alt="" />
        Hosted by Design Lab North ·{" "}
        <a href="https://designlabnorth.com">designlabnorth.com</a>
      </p>
    </div>
  );
}

function isShown(content: KitContent, key: "logos" | "banners" | "people" | "files"): boolean {
  return content.shown?.[key] !== false;
}

function railKicker(id: ModyuPageId): string {
  if (id === "founder" || id === "our-story" || id === "follicle" || id === "quotes" || id === "about") {
    return "Brand & background";
  }
  if (id === "angles") return "Campaigns";
  return "Product & service";
}

function DownloadPdf({ href }: { href: string }) {
  return (
    <p className="epk-article__acts no-print">
      <Link className="epk-contact-btn chamfer" href={href}>
        Download PDF
      </Link>
    </p>
  );
}

function ArticleShell({
  kicker,
  kickerHref,
  title,
  pdfHref,
  children,
}: {
  kicker: string;
  kickerHref: string;
  title: string;
  pdfHref: string;
  children: ReactNode;
}) {
  return (
    <article className="epk-article epk-modyu-page">
      <p className="kicker">
        <Link href={kickerHref}>{kicker}</Link>
      </p>
      <h1>{title}</h1>
      {children}
      <DownloadPdf href={pdfHref} />
    </article>
  );
}

function Home({ doc, extras }: { doc: EpkDoc; extras: EpkStory[] }) {
  const campaigns = [
    ...doc.pitches.map((pitch) => ({
      href: pageHref(`campaigns/${pitch.id}`),
      kicker: pitch.kicker || "Campaign",
      title: pitch.title,
    })),
    {
      href: pageHref("founder"),
      kicker: "About",
      title: "Ann-Marie — the hairdresser who asked what happens after the surgery",
    },
    ...extras.map((row) => ({
      href: pageHref(`campaigns/${row.id}`),
      kicker: "Campaign",
      title: row.title,
    })),
  ];
  return (
    <section className="epk-modyu-home">
      <p className="kicker">HT4 · Electronic Press Kit</p>
      <h1>Campaigns</h1>
      <p className="epk-modyu-lede">
        Open a page, then download that page as a PDF.
      </p>
      <ul className="epk-story-plates is-page">
        {campaigns.map((row, i) => (
          <li key={row.href}>
            <Link href={row.href}>
              <span className="epk-plate__cap">
                {String(i + 1).padStart(2, "0")} · {row.kicker}
                <strong>{row.title}</strong>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CampaignIndex({ doc, extras }: { doc: EpkDoc; extras: EpkStory[] }) {
  return (
    <section>
      <p className="kicker">Campaigns</p>
      <h1>Stories ready to run</h1>
      <p className="epk-modyu-lede">
        Each story is written for a journalist to lift. HT4 does not need to be the hero of paragraph one.
      </p>
      <ul className="epk-story-plates is-page">
        {doc.pitches.map((pitch, i) => (
          <li key={pitch.id}>
            <Link href={pageHref(`campaigns/${pitch.id}`)}>
              <span className="epk-plate__cap">
                Story {i + 1}
                <strong>{pitch.title}</strong>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link href={pageHref("founder")}>
            <span className="epk-plate__cap">
              About
              <strong>Ann-Marie [Founder]</strong>
            </span>
          </Link>
        </li>
        {extras.map((row) => (
          <li key={row.id}>
            <Link href={pageHref(`campaigns/${row.id}`)}>
              <span className="epk-plate__cap">
                Campaign
                <strong>{row.title}</strong>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PitchBody({ pitch }: { pitch: EpkPitch }) {
  return (
    <>
      {pitch.kicker ? <p className="epk-note">{pitch.kicker}</p> : null}
      {pitch.question ? <p className="epk-line">{pitch.question}</p> : null}
      {pitch.story.map((para) => (
        <p key={para.slice(0, 40)}>{para}</p>
      ))}
      {pitch.illustration?.map((para) => (
        <p key={para.slice(0, 40)}>{para}</p>
      ))}
      {pitch.whyNow ? (
        <>
          <h2>Why it matters now</h2>
          <p>{pitch.whyNow}</p>
        </>
      ) : null}
      {pitch.bestFor ? (
        <>
          <h2>Best for</h2>
          <p>{pitch.bestFor}</p>
        </>
      ) : null}
      {pitch.evidence ? (
        <>
          <h2>Evidence</h2>
          <p>{pitch.evidence}</p>
        </>
      ) : null}
      {pitch.ask ? (
        <>
          <h2>Ask</h2>
          <p>{pitch.ask}</p>
        </>
      ) : null}
    </>
  );
}

function StoryBody({ story }: { story: EpkStory }) {
  return (
    <>
      {story.imageHref && isImageHref(story.imageHref) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="epk-article__img chamfer" src={story.imageHref} alt="" />
      ) : null}
      {story.body.split(/\n\s*\n/).map((para) => (
        <p key={para.slice(0, 40)}>{para.trim()}</p>
      ))}
    </>
  );
}

function DocBody({ doc, page, extras }: { doc: EpkDoc; page: ModyuPageId; extras: EpkStory[] }) {
  if (page === "our-story") {
    return (
      <>
        {doc.story.paras.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {doc.story.boilerplate ? (
          <div className="epk-boilerplate">
            <p className="epk-boilerplate__heading">{doc.story.boilerplate.heading}</p>
            {doc.story.boilerplate.paras.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>
        ) : null}
        {doc.storyCont?.line ? <p className="epk-line">{doc.storyCont.line}</p> : null}
        {doc.storyCont?.sub ? <p>{doc.storyCont.sub}</p> : null}
        {doc.storyCont?.facts?.length ? (
          <dl className="epk-census">
            {doc.storyCont.facts.map((fact) => (
              <div key={fact.value}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {doc.storyCont?.source ? <p className="epk-source">{doc.storyCont.source}</p> : null}
      </>
    );
  }
  if (page === "founder" && doc.founder) {
    const f = doc.founder;
    return (
      <>
        {f.kicker ? <p className="epk-note">{f.kicker}</p> : null}
        {f.pull ? <blockquote className="epk-pull">“{f.pull}”</blockquote> : null}
        {f.paras.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {f.sidebar ? (
          <div className="epk-boilerplate">
            <p className="epk-boilerplate__heading">{f.sidebar.title}</p>
            {f.sidebar.paras.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>
        ) : null}
        {f.talksHeading ? <h2>{f.talksHeading}</h2> : null}
        {f.talksIntro ? <p>{f.talksIntro}</p> : null}
        {f.talks?.length ? (
          <ul className="epk-plain">
            {f.talks.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {f.talksNote ? <p className="epk-source">{f.talksNote}</p> : null}
      </>
    );
  }
  if (page === "about" && doc.about) {
    return (
      <>
        {doc.about.kicker ? <p className="epk-note">{doc.about.kicker}</p> : null}
        {doc.about.paras.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {doc.about.pillars?.map((pillar) => (
          <div key={pillar.title}>
            <h2>{pillar.title}</h2>
            <p>{pillar.body}</p>
          </div>
        ))}
        {doc.about.pitch ? <p>{doc.about.pitch}</p> : null}
      </>
    );
  }
  if (page === "follicle" && doc.satellite) {
    return (
      <>
        {doc.satellite.paras.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {doc.satellite.bullets?.map((row) => (
          <div key={row.title}>
            <h2>{row.title}</h2>
            <p>{row.body}</p>
          </div>
        ))}
      </>
    );
  }
  if (page === "quotes") {
    return (
      <>
        {doc.quoteBank.map((group) => (
          <div key={group.heading}>
            <h2>{group.heading}</h2>
            {group.quotes.map((q) => (
              <blockquote key={q.text.slice(0, 48)} className="epk-pull">
                “{q.text}”
                {q.cite ? <cite>{q.cite}</cite> : null}
              </blockquote>
            ))}
          </div>
        ))}
      </>
    );
  }
  if (page === "system" && doc.system) {
    return (
      <>
        {doc.system.intro.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        {doc.system.phases.map((phase) => (
          <div key={phase.title}>
            <h2>{phase.title}</h2>
            <p>{phase.body}</p>
          </div>
        ))}
        {doc.system.close ? <p className="epk-line">{doc.system.close}</p> : null}
      </>
    );
  }
  if (page === "evidence" && doc.evidence) {
    return (
      <>
        <p>{doc.evidence.intro}</p>
        {doc.evidence.blocks.map((block) => (
          <div key={block.title}>
            <h2>{block.title}</h2>
            <p>{block.body}</p>
          </div>
        ))}
        <h2>We can say</h2>
        <ul className="epk-plain">
          {doc.evidence.canSay.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h2>We never say</h2>
        <ul className="epk-plain">
          {doc.evidence.neverSay.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </>
    );
  }
  if (page === "claims" && doc.claims) {
    return (
      <>
        {doc.claims.intro.map((para) => (
          <p key={para.slice(0, 40)}>{para}</p>
        ))}
        <h2>We stand by</h2>
        <ul className="epk-plain">
          {doc.claims.stand.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <h2>We never claim</h2>
        <ul className="epk-plain">
          {doc.claims.never.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {doc.claims.quote ? (
          <blockquote className="epk-pull">
            “{doc.claims.quote.text}”
            {doc.claims.quote.cite ? <cite>{doc.claims.quote.cite}</cite> : null}
          </blockquote>
        ) : null}
        {doc.claims.note ? <p className="epk-source">{doc.claims.note}</p> : null}
      </>
    );
  }
  if (page === "facts") {
    return (
      <>
        <dl className="epk-facts">
          {doc.facts.rows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
        {doc.faqs.map((faq) => (
          <div key={faq.q}>
            <h2>{faq.q}</h2>
            <p>{faq.a}</p>
          </div>
        ))}
      </>
    );
  }
  if (page === "angles" && doc.extras) {
    return (
      <>
        <p>{doc.extras.intro}</p>
        {doc.extras.items.map((item) => (
          <div key={item.title}>
            <p className="epk-note">{item.desks}</p>
            <h2>{item.title}</h2>
            {item.body.map((para) => (
              <p key={para.slice(0, 40)}>{para}</p>
            ))}
          </div>
        ))}
      </>
    );
  }
  if (page === "contact") {
    const c = doc.contact;
    return (
      <>
        {c.role ? <p>{c.role}</p> : null}
        <p>
          <a href={`mailto:${c.email}`}>{c.email}</a>
        </p>
        {c.web ? (
          <p>
            <a href={c.web}>{c.web.replace(/^https?:\/\//, "")}</a>
          </p>
        ) : null}
        {c.available?.length ? (
          <ul className="epk-plain">
            {c.available.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        {c.legal ? <p className="epk-source">{c.legal}</p> : null}
        <p className="epk-source">{c.disclaimer}</p>
      </>
    );
  }
  void extras;
  return <p>This page is not in the pack.</p>;
}

function Vault({
  logos,
  banners,
  people,
  files,
}: {
  logos: AssetItem[];
  banners: AssetItem[];
  people: AssetItem[];
  files: AssetItem[];
}) {
  const lanes: { id: EpkSection; items: AssetItem[] }[] = (
    [
      { id: "logos" as const, items: logos },
      { id: "banners" as const, items: banners },
      { id: "people" as const, items: people },
      { id: "files" as const, items: files },
    ] as { id: EpkSection; items: AssetItem[] }[]
  ).filter((row) => row.items.length);
  return (
    <section>
      <p className="kicker">Assets</p>
      <h1>Asset vault</h1>
      <p className="epk-modyu-lede">
        Logos, banners and people stills for this pack. Download a file from here.
      </p>
      {!lanes.length ? <p>Nothing in the vault yet.</p> : null}
      {lanes.map((lane) => (
        <div key={lane.id}>
          <h2>{SECTION_LABEL[lane.id]}</h2>
          <ul className="epk-still-grid">
            {lane.items.map((item) => (
              <li key={item.id}>
                <a className="epk-still-plate chamfer" href={item.href} download>
                  <Still href={item.href} title={item.title} />
                </a>
                <span className="assets-caption">{item.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function PrintSheet({
  back,
  title,
  logo,
  banner,
  children,
}: {
  back: string;
  title: string;
  logo?: string;
  banner?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <article className="epk-print epk-modyu-print">
      <p className="kicker">HT4 · Electronic Press Kit</p>
      <h1>{title}</h1>
      {children}
      <footer className="epk-pdf-foot">
        {logo && isImageHref(logo) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="epk-pdf-foot__logo" src={logo} alt="" />
        ) : null}
        {banner && isImageHref(banner) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="epk-pdf-foot__banner" src={banner} alt="" />
        ) : null}
      </footer>
      <p className="no-print">
        <Link href={back}>Back</Link>
        {" · "}
        <button type="button" className="assets-text-btn" onClick={() => window.print()}>
          Download PDF
        </button>
      </p>
    </article>
  );
}
