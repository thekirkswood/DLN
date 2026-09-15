"use client";

import { useEffect } from "react";
import Link from "next/link";
import { isImageHref, isPdfHref, isShared } from "@/lib/assets-view";
import { EpkStudioStamp } from "@/components/EpkStudioStamp";
import { firstLogo, laneStill } from "@/lib/epk-cover";
import { isShown, livePromos, liveStories, type KitContent, type EpkStory } from "@/lib/epk-content-model";
import type { EpkDoc, VaultLaneId } from "@/lib/epk-doc";
import { epkHref } from "@/lib/epk-map";
import { SECTION_LABEL, sectionItems, type EpkSection } from "@/lib/epk-sections";
import type { AssetItem } from "@/lib/assets";

type Path = string[];

function paras(text: string): string[] {
  return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
}

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

function stillHref(kit: string, item: AssetItem | undefined, fallback: string): string {
  if (!item) return epkHref(kit, fallback);
  if (item.flags.logo) return epkHref(kit, `logos/${item.id}`);
  if (item.flags.banner) return epkHref(kit, `banners/${item.id}`);
  if (item.flags.people) return epkHref(kit, `people/${item.id}`);
  return epkHref(kit, `files/${item.id}`);
}

export function EpkKitApp({
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
  path: Path;
  studio?: boolean;
  tagged?: boolean;
}) {
  const kit = doc.kit;
  const pack = items.filter(isShared);
  const section = (path[0] || "") as EpkSection | "stories" | "promos" | "contact" | "overview" | "";
  const id = path[1] || "";
  const print = path[2] === "print";
  const logos = isShown(content.shown, "logos") ? sectionItems(pack, "logos") : [];
  const banners = isShown(content.shown, "banners") ? sectionItems(pack, "banners") : [];
  const people = isShown(content.shown, "people") ? sectionItems(pack, "people") : [];
  const files = isShown(content.shown, "files") ? sectionItems(pack, "files") : [];
  const stories = isShown(content.shown, "stories") ? liveStories(content) : [];
  const promos = isShown(content.shown, "promos") ? livePromos(content) : [];
  const story = stories.find((s) => s.id === id);
  const promo = promos.find((p) => p.id === id);
  const still =
    logos.find((i) => i.id === id) ||
    banners.find((i) => i.id === id) ||
    people.find((i) => i.id === id) ||
    files.find((i) => i.id === id) ||
    pack.find((i) => i.id === id);
  const mark = firstLogo(pack);
  const overview = content.overview.length ? content.overview : doc.story.paras;

  useEffect(() => {
    if (!studio && !tagged) return;
    fetch("/api/epk/stamp", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kit }),
    }).catch(() => {});
  }, [kit, studio, tagged]);

  function leave() {
    if (tagged) window.location.href = "/account";
    else if (studio) window.location.href = "/epk";
    else {
      fetch("/api/epk/leave", { method: "POST", credentials: "include" }).then(() => {
        window.location.href = "/epk";
      });
    }
  }

  if (print && story) {
    return <PrintStory kit={kit} name={doc.product} story={story} />;
  }

  const vault = [
    { href: epkHref(kit, "logos"), label: "Logos", on: Boolean(logos.length), current: section === "logos" },
    { href: epkHref(kit, "banners"), label: "Banners", on: Boolean(banners.length), current: section === "banners" },
    { href: epkHref(kit, "people"), label: "People", on: Boolean(people.length), current: section === "people" },
    { href: epkHref(kit, "files"), label: "Files", on: Boolean(files.length), current: section === "files" },
  ].filter((row) => row.on);

  return (
    <div className="epk epk-map">
      <header className="epk-map__bar">
        <Link className="epk-map__kit" href={epkHref(kit)}>
          <strong>{doc.product}</strong>
          <span>{doc.kitTitle}</span>
        </Link>
        <EpkStudioStamp />
        <div className="epk-map__marks">
          {(logos.length ? logos : mark ? [mark] : []).slice(0, 2).map((row) =>
            isImageHref(row.href) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={row.id} src={row.href} alt="" />
            ) : null,
          )}
          <Link className="epk-contact-btn chamfer" href={epkHref(kit, "contact")}>
            Contact
          </Link>
        </div>
      </header>
      <div className="epk-map__body">
        <aside className="epk-rail chamfer">
          {stories.length ? (
            <p className="epk-rail__group">
              <Link href={epkHref(kit, "stories")} aria-current={section === "stories" ? "page" : undefined}>
                Stories ready to run
              </Link>
              {stories.slice(0, 5).map((row) => (
                <Link key={row.id} href={epkHref(kit, `stories/${row.id}`)}>
                  {row.title}
                </Link>
              ))}
            </p>
          ) : null}
          {promos.length ? (
            <p className="epk-rail__group">
              <Link href={epkHref(kit, "promos")} aria-current={section === "promos" ? "page" : undefined}>
                Promotions
              </Link>
            </p>
          ) : null}
          {vault.length ? (
            <p className="epk-rail__group">
              <span>Asset vault</span>
              {vault.map((row) => (
                <Link key={row.href} href={row.href} aria-current={row.current ? "page" : undefined}>
                  {row.label}
                </Link>
              ))}
            </p>
          ) : null}
          <p className="epk-rail__group">
            <Link href={epkHref(kit)} aria-current={!section ? "page" : undefined}>
              The kit
            </Link>
            <Link href={epkHref(kit, "overview")} aria-current={section === "overview" ? "page" : undefined}>
              Our story
            </Link>
            <Link href={epkHref(kit, "contact")} aria-current={section === "contact" ? "page" : undefined}>
              Contact
            </Link>
          </p>
          <p className="epk-rail__foot">
            {studio ? <Link href="/epk">Kits</Link> : null}
            {tagged ? <Link href="/account">Account</Link> : null}
            {studio || tagged ? (
              <Link href={tagged ? `/account?view=press&kit=${kit}` : `/account?desk=epk&kit=${kit}`}>
                Edit kit
              </Link>
            ) : (
              <button type="button" className="assets-text-btn" onClick={leave}>
                Leave
              </button>
            )}
          </p>
        </aside>
        <div className="epk-map__main">
          {!section ? (
            <Cover
              kit={kit}
              doc={doc}
              items={pack}
              content={content}
              stories={stories}
              logos={logos}
              banners={banners}
              people={people}
              files={files}
            />
          ) : null}
          {section === "logos" || section === "banners" || section === "people" || section === "files" ? (
            still && id ? (
              <StillPage kit={kit} section={section} item={still} />
            ) : (
              <StillList
                kit={kit}
                section={section}
                items={
                  section === "logos"
                    ? logos
                    : section === "banners"
                      ? banners
                      : section === "people"
                        ? people
                        : files
                }
              />
            )
          ) : null}
          {section === "stories" ? (
            story ? (
              <Article
                kit={kit}
                kind="stories"
                id={story.id}
                title={story.title}
                body={story.body}
                imageHref={story.imageHref}
                pdf
              />
            ) : (
              <PlateList kit={kit} kind="stories" heading="Stories ready to run" rows={stories} />
            )
          ) : null}
          {section === "promos" ? (
            promo ? (
              <Article
                kit={kit}
                kind="promos"
                id={promo.id}
                title={promo.title}
                body={promo.body}
                imageHref={promo.imageHref}
              />
            ) : (
              <PlateList kit={kit} kind="promos" heading="Promotions" rows={promos} />
            )
          ) : null}
          {section === "overview" ? <OurStory doc={doc} overview={overview} /> : null}
          {section === "contact" ? <Contact doc={doc} /> : null}
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

function Cover({
  kit,
  doc,
  items,
  content,
  stories,
  logos,
  banners,
  people,
  files,
}: {
  kit: string;
  doc: EpkDoc;
  items: AssetItem[];
  content: KitContent;
  stories: EpkStory[];
  logos: AssetItem[];
  banners: AssetItem[];
  people: AssetItem[];
  files: AssetItem[];
}) {
  const heroes: VaultLaneId[] = ["founder", "product", "campaigns"];
  const vault: { lane: VaultLaneId; href: string; label: string; on: boolean }[] = [
    { lane: "logos", href: epkHref(kit, "logos"), label: "Logos", on: Boolean(logos.length) },
    { lane: "product", href: epkHref(kit, "banners"), label: "Banners", on: Boolean(banners.length) },
    { lane: "founder", href: epkHref(kit, "people"), label: "People", on: Boolean(people.length) },
    { lane: "campaigns", href: epkHref(kit, "files"), label: "Files", on: Boolean(files.length) },
  ];
  return (
    <section className="epk-cover-map">
      <div className="epk-heroes">
        {heroes.map((lane) => {
          const item = laneStill(items, content.cover, lane);
          const fallback = lane === "founder" ? "people" : lane === "product" ? "banners" : "files";
          const label = doc.lanes.find((row) => row.id === lane)?.label || lane;
          return (
            <Link key={lane} className={`epk-hero chamfer is-${lane}`} href={stillHref(kit, item, fallback)}>
              {item && isImageHref(item.href) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.href} alt="" />
              ) : (
                <span className="epk-hero__empty" />
              )}
              {lane === "founder" && doc.coverLabels?.length ? (
                <ul className="epk-hero__labels">
                  {doc.coverLabels.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              ) : null}
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
      {stories.length ? (
        <ul className="epk-story-plates">
          {stories.slice(0, 5).map((row, i) => (
            <li key={row.id}>
              <Link href={epkHref(kit, `stories/${row.id}`)}>
                <span className="epk-plate__still chamfer">
                  {row.imageHref && isImageHref(row.imageHref) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={row.imageHref} alt="" />
                  ) : null}
                </span>
                <span className="epk-plate__cap">
                  Story {i + 1}
                  <strong>{row.title}</strong>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="epk-vault-strip chamfer">
        <div>
          <p className="kicker">Asset vault</p>
          <p>{doc.coverNote}</p>
        </div>
        <ul>
          {vault
            .filter((row) => row.on)
            .map((row) => {
              const item = laneStill(items, content.cover, row.lane);
              return (
                <li key={row.lane}>
                  <Link href={row.href}>
                    <span className="epk-plate__still chamfer">
                      {item && isImageHref(item.href) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.href} alt="" />
                      ) : null}
                    </span>
                    <span className="epk-plate__cap">{row.label}</span>
                  </Link>
                </li>
              );
            })}
        </ul>
      </div>
    </section>
  );
}

function OurStory({ doc, overview }: { doc: EpkDoc; overview: string[] }) {
  return (
    <section>
      <div className="epk-story-block">
        <h1>{doc.story.title}</h1>
        {overview.map((para) => (
          <p key={para.slice(0, 48)}>{para}</p>
        ))}
        {doc.story.boilerplate ? (
          <div className="epk-boilerplate">
            <p className="epk-boilerplate__heading">{doc.story.boilerplate.heading}</p>
            {doc.story.boilerplate.paras.map((para) => (
              <p key={para.slice(0, 48)}>{para}</p>
            ))}
          </div>
        ) : null}
      </div>
      {doc.storyCont?.facts?.length ? (
        <dl className="epk-census">
          {doc.storyCont.facts.slice(0, 6).map((fact) => (
            <div key={fact.value}>
              <dt>{fact.value}</dt>
              <dd>{fact.label}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      {doc.storyCont?.source ? <p className="epk-source">{doc.storyCont.source}</p> : null}
      {doc.storyCont?.line ? <p className="epk-line">{doc.storyCont.line}</p> : null}
      {doc.storyCont?.sub ? <p>{doc.storyCont.sub}</p> : null}
    </section>
  );
}

function StillList({ kit, section, items }: { kit: string; section: EpkSection; items: AssetItem[] }) {
  return (
    <section>
      <p className="kicker">{SECTION_LABEL[section]}</p>
      <h1>{SECTION_LABEL[section]}</h1>
      {!items.length ? <p>Nothing in this section yet.</p> : null}
      <ul className="epk-still-grid">
        {items.map((item) => (
          <li key={item.id}>
            <Link className="epk-still-plate chamfer" href={epkHref(kit, `${section}/${item.id}`)}>
              <Still href={item.href} title={item.title} />
            </Link>
            <span className="assets-caption">{item.title}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function StillPage({ kit, section, item }: { kit: string; section: EpkSection; item: AssetItem }) {
  return (
    <article className="epk-still">
      <p className="kicker">
        <Link href={epkHref(kit, section)}>{SECTION_LABEL[section]}</Link>
      </p>
      <h1>{item.title}</h1>
      <div className="epk-still__frame chamfer">
        <Still href={item.href} title={item.title} />
      </div>
      {item.note ? <p className="epk-still__note">{item.note}</p> : null}
      <p>
        <a href={item.href} download>
          Download
        </a>
      </p>
    </article>
  );
}

function PlateList({
  kit,
  kind,
  heading,
  rows,
}: {
  kit: string;
  kind: "stories" | "promos";
  heading: string;
  rows: { id: string; title: string; body: string; imageHref?: string }[];
}) {
  return (
    <section>
      <p className="kicker">{heading}</p>
      <h1>{heading}</h1>
      {!rows.length ? <p>Nothing in this section yet.</p> : null}
      <ul className="epk-story-plates is-page">
        {rows.map((row, i) => (
          <li key={row.id}>
            <Link href={epkHref(kit, `${kind}/${row.id}`)}>
              <span className="epk-plate__still chamfer">
                {row.imageHref && isImageHref(row.imageHref) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={row.imageHref} alt="" />
                ) : null}
              </span>
              <span className="epk-plate__cap">
                {kind === "stories" ? `Story ${i + 1}` : "Promotion"}
                <strong>{row.title}</strong>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Article({
  kit,
  kind,
  id,
  title,
  body,
  imageHref,
  pdf,
}: {
  kit: string;
  kind: "stories" | "promos";
  id: string;
  title: string;
  body: string;
  imageHref?: string;
  pdf?: boolean;
}) {
  return (
    <article className="epk-article">
      <p className="kicker">
        <Link href={epkHref(kit, kind)}>{kind === "stories" ? "Stories" : "Promotions"}</Link>
      </p>
      <h1>{title}</h1>
      {imageHref && isImageHref(imageHref) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="epk-article__img chamfer" src={imageHref} alt="" />
      ) : null}
      {paras(body).map((para) => (
        <p key={para.slice(0, 48)}>{para}</p>
      ))}
      <p className="epk-article__acts">
        <Link href={epkHref(kit)}>The kit</Link>
        {pdf ? <Link href={epkHref(kit, `stories/${id}/print`)}>Save as PDF</Link> : null}
      </p>
    </article>
  );
}

function Contact({ doc }: { doc: EpkDoc }) {
  const c = doc.contact;
  return (
    <section className="epk-contact">
      <p className="kicker">Contact</p>
      <h1>{c.name}</h1>
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
        <ul>
          {c.available.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <p className="epk-source">{c.disclaimer}</p>
    </section>
  );
}

function PrintStory({ kit, name, story }: { kit: string; name: string; story: EpkStory }) {
  useEffect(() => {
    const t = window.setTimeout(() => window.print(), 400);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <article className="epk-print">
      <p className="kicker">{name}</p>
      <h1>{story.title}</h1>
      {story.imageHref && isImageHref(story.imageHref) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={story.imageHref} alt="" />
      ) : null}
      {paras(story.body).map((para) => (
        <p key={para.slice(0, 48)}>{para}</p>
      ))}
      <p>
        <Link href={epkHref(kit, `stories/${story.id}`)}>Back</Link>
        {" · "}
        <button type="button" className="assets-text-btn" onClick={() => window.print()}>
          Save as PDF
        </button>
      </p>
    </article>
  );
}
