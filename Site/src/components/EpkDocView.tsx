import { isImageHref } from "@/lib/assets-view";
import { coverItem, itemsForLane, type EpkDoc, type Packish } from "@/lib/epk-doc";

export type PackItem = Packish & {
  id: string;
  title: string;
  kind: string;
  note?: string;
};

function VaultPlate({
  item,
  onPick,
}: {
  item: PackItem;
  onPick: (item: PackItem) => void;
}) {
  const image = isImageHref(item.href);
  return (
    <li>
      <button type="button" className="assets-plate chamfer" onClick={() => onPick(item)}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.href} alt="" />
        ) : (
          <span className="assets-file">
            <span className="kicker">File</span>
            <strong>{item.title}</strong>
          </span>
        )}
      </button>
      <span className="assets-caption">{item.title}</span>
    </li>
  );
}

function LaneCell({
  item,
  label,
}: {
  item?: PackItem;
  label: string;
}) {
  return (
    <div className="epk-lane">
      <p className="epk-lane__label">{label}</p>
      {item && isImageHref(item.href) ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.href} alt="" />
      ) : (
        <div className="epk-lane__empty" />
      )}
    </div>
  );
}

export function EpkDocView({
  doc,
  items,
  extra,
  onPick,
}: {
  doc: EpkDoc;
  items: PackItem[];
  extra?: string[];
  onPick: (item: PackItem) => void;
}) {
  const vaultItems = items.filter((item) => !item.href.toLowerCase().includes("/play/"));
  const systemStills = itemsForLane(vaultItems, "product", 8);

  return (
    <>
      <section className="epk-cover-map" id="cover">
        <p className="epk-cover-map__product">{doc.product}</p>
        <p className="epk-cover-map__kit">{doc.kitTitle}</p>
        <p className="epk-cover-map__people">{doc.peopleLine}</p>
        {doc.coverLabels?.length ? (
          <ul className="epk-cover-map__labels">
            {doc.coverLabels.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        ) : null}
        <div className="epk-lanes">
          {doc.lanes.map((lane) => (
            <LaneCell key={lane.id} label={lane.label} item={coverItem(vaultItems, lane.id)} />
          ))}
        </div>
        <p className="epk-cover-map__note">{doc.coverNote}</p>
        {doc.pitches.length || doc.founder ? (
          <ol className="epk-story-strip" id="stories">
            {doc.pitches.map((pitch, i) => (
              <li key={pitch.id}>
                <a href={`#${pitch.id}`}>
                  <span>Story {i + 1}</span>
                  {pitch.title}
                </a>
              </li>
            ))}
            {doc.founder ? (
              <li>
                <a href="#founder">
                  <span>Story {doc.pitches.length + 1}</span>
                  {doc.founder.title}
                </a>
              </li>
            ) : null}
          </ol>
        ) : null}
      </section>

      <section id="overview" className="epk-panel epk-panel--wide">
        <p className="kicker">Our story</p>
        <h2>{doc.story.title}</h2>
        {doc.story.paras.map((para) => (
          <p key={para.slice(0, 48)}>{para}</p>
        ))}
        {extra?.filter(Boolean).map((para) => (
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
      </section>

      {doc.storyCont ? (
        <section className="epk-panel epk-panel--wide">
          <dl className="epk-census">
            {doc.storyCont.facts.map((fact) => (
              <div key={fact.value}>
                <dt>{fact.value}</dt>
                <dd>{fact.label}</dd>
              </div>
            ))}
          </dl>
          {doc.storyCont.source ? <p className="epk-source">{doc.storyCont.source}</p> : null}
          <p className="epk-line">{doc.storyCont.line}</p>
          {doc.storyCont.sub ? <p>{doc.storyCont.sub}</p> : null}
        </section>
      ) : null}

      {doc.pitches.map((pitch) => (
        <article key={pitch.id} id={pitch.id} className="epk-pitch">
          {pitch.kicker ? <p className="kicker">{pitch.kicker}</p> : null}
          <h2>{pitch.title}</h2>
          {pitch.question ? <p className="epk-question">{pitch.question}</p> : null}
          {pitch.story.map((para, i) => (
            <p key={para.slice(0, 40)}>
              {i === 0 ? <strong>The story — </strong> : null}
              {para}
            </p>
          ))}
          {pitch.illustration?.map((para, i) => (
            <p key={para.slice(0, 40)}>
              {i === 0 ? <strong>The illustration — </strong> : null}
              {para}
            </p>
          ))}
          {pitch.whyNow ? (
            <p>
              <strong>Why it matters now — </strong>
              {pitch.whyNow}
            </p>
          ) : null}
          {pitch.bestFor ? (
            <p>
              <strong>Best for — </strong>
              {pitch.bestFor}
            </p>
          ) : null}
          {pitch.evidence ? (
            <p>
              <strong>The evidence &amp; hook — </strong>
              {pitch.evidence}
            </p>
          ) : null}
          {pitch.ask ? (
            <p>
              <strong>Ask us — </strong>
              {pitch.ask}
            </p>
          ) : null}
        </article>
      ))}

      {doc.founder ? (
        <section id="founder" className="epk-founder">
          {doc.founder.kicker ? <p className="kicker">{doc.founder.kicker}</p> : null}
          <h2>{doc.founder.title}</h2>
          {doc.founder.pull ? <p className="epk-pull">“{doc.founder.pull}”</p> : null}
          <div className="epk-founder__grid">
            <div>
              {doc.founder.paras.map((para) => (
                <p key={para.slice(0, 40)}>{para}</p>
              ))}
            </div>
            {doc.founder.sidebar ? (
              <aside className="epk-sidebar">
                <p className="epk-sidebar__title">{doc.founder.sidebar.title}</p>
                {doc.founder.sidebar.paras.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </aside>
            ) : null}
          </div>
          {doc.founder.talks?.length ? (
            <div className="epk-talks">
              <h3>{doc.founder.talksHeading || "What they can talk about"}</h3>
              {doc.founder.talksIntro ? <p>{doc.founder.talksIntro}</p> : null}
              <ul>
                {doc.founder.talks.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              {doc.founder.talksNote ? <p className="status">{doc.founder.talksNote}</p> : null}
            </div>
          ) : null}
        </section>
      ) : null}

      {doc.extras ? (
        <section className="epk-extras">
          <p className="kicker">Further angles</p>
          <p>{doc.extras.intro}</p>
          <ul className="epk-extras__grid">
            {doc.extras.items.map((item) => (
              <li key={item.title}>
                <p className="kicker">{item.desks}</p>
                <h3>{item.title}</h3>
                {item.body.map((para) => (
                  <p key={para.slice(0, 40)}>{para}</p>
                ))}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {doc.system ? (
        <section id="system" className="epk-panel epk-panel--wide">
          <p className="kicker">System</p>
          <h2>{doc.system.title}</h2>
          {doc.system.intro.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <ol className="epk-phases">
            {doc.system.phases.map((phase) => (
              <li key={phase.title}>
                <h3>{phase.title}</h3>
                <p>{phase.body}</p>
              </li>
            ))}
          </ol>
          {doc.system.close ? <p className="epk-line">{doc.system.close}</p> : null}
          {systemStills.length ? (
            <ul className="assets-grid epk-grid">
              {systemStills.map((item) => (
                <VaultPlate key={`sys-${item.id}`} item={item} onPick={onPick} />
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      {doc.evidence ? (
        <section id="evidence" className="epk-evidence">
          <p className="kicker">The evidence</p>
          <h2>{doc.evidence.title}</h2>
          <p>{doc.evidence.intro}</p>
          {doc.evidence.blocks.map((block) => (
            <div key={block.title} className="epk-evidence__block">
              <h3>{block.title}</h3>
              <p>{block.body}</p>
            </div>
          ))}
          <div className="epk-say">
            <div>
              <p className="kicker">We can say</p>
              <ul>
                {doc.evidence.canSay.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker">We never say</p>
              <ul>
                {doc.evidence.neverSay.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      {doc.claims ? (
        <section id="claims" className="epk-panel epk-panel--wide">
          <p className="kicker">What we claim — and what we won’t</p>
          <h2>{doc.claims.title}</h2>
          {doc.claims.intro.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <div className="epk-say">
            <div>
              <p className="kicker">Claims we stand behind</p>
              <ul>
                {doc.claims.stand.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="kicker">Claims we deliberately never make</p>
              <ul>
                {doc.claims.never.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          </div>
          {doc.claims.quote ? (
            <blockquote className="epk-pull">
              <p>“{doc.claims.quote.text}”</p>
              {doc.claims.quote.cite ? <cite>{doc.claims.quote.cite}</cite> : null}
            </blockquote>
          ) : null}
          {doc.claims.note ? <p className="status">{doc.claims.note}</p> : null}
        </section>
      ) : null}

      <section id="quotes" className="epk-quotes-bank">
        <p className="kicker">Quote bank</p>
        <h2>Quotes you can lift</h2>
        <div className="epk-quotes-bank__grid">
          {doc.quoteBank.map((group) => (
            <div key={group.heading}>
              <h3>{group.heading}</h3>
              {group.quotes.map((quote) => (
                <blockquote key={quote.text.slice(0, 48)}>
                  <p>“{quote.text}”</p>
                  {quote.cite ? <cite>{quote.cite}</cite> : null}
                </blockquote>
              ))}
            </div>
          ))}
        </div>
      </section>

      <section id="facts" className="epk-facts">
        <div>
          <p className="kicker">Fast facts</p>
          <h2>{doc.facts.heading}</h2>
          <dl className="epk-facts__rows">
            {doc.facts.rows.map((row) => (
              <div key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        {doc.faqs.length ? (
          <div>
            <p className="kicker">FAQ</p>
            <h2>Frequently asked questions</h2>
            {doc.faqs.map((faq) => (
              <div key={faq.q} className="epk-faq">
                <h3>{faq.q}</h3>
                <p>{faq.a}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {doc.about ? (
        <section id="about" className="epk-panel epk-panel--wide">
          {doc.about.kicker ? <p className="kicker">{doc.about.kicker}</p> : null}
          <h2>{doc.about.title}</h2>
          {doc.about.paras.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          {doc.about.pillars?.length ? (
            <ul className="epk-pillars">
              {doc.about.pillars.map((pillar) => (
                <li key={pillar.title}>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {doc.about.pitch ? <p>{doc.about.pitch}</p> : null}
        </section>
      ) : null}

      {doc.satellite ? (
        <section id="follicle" className="epk-panel epk-panel--wide">
          <p className="kicker">Channel</p>
          <h2>{doc.satellite.title}</h2>
          {doc.satellite.paras.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          {doc.satellite.bullets?.length ? (
            <ul className="epk-pillars">
              {doc.satellite.bullets.map((bullet) => (
                <li key={bullet.title}>
                  <h3>{bullet.title}</h3>
                  <p>{bullet.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ) : null}

      <section id="assets">
        <p className="kicker">Asset vault</p>
        <h2>What we share</h2>
        <p className="body">{doc.coverNote}</p>
        {!vaultItems.length ? <p className="body">This pack is being prepared.</p> : null}
        {doc.lanes.map((lane) => {
          const laneItems = itemsForLane(vaultItems, lane.id, 12);
          if (!laneItems.length) return null;
          return (
            <div key={lane.id} id={`assets-${lane.id}`} className="epk-vault-lane">
              <p className="status">{lane.label}</p>
              <ul className="assets-grid epk-grid">
                {laneItems.map((item) => (
                  <VaultPlate key={item.id} item={item} onPick={onPick} />
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      <section id="contact" className="epk-panel">
        <p className="kicker">Contact</p>
        <h2>Let’s help you tell the story</h2>
        <p>
          {doc.contact.name}
          {doc.contact.role ? <span> · {doc.contact.role}</span> : null}
        </p>
        <p>
          <a href={`mailto:${doc.contact.email}`}>{doc.contact.email}</a>
        </p>
        {doc.contact.web ? (
          <p>
            <a href={doc.contact.web}>{doc.contact.web.replace(/^https?:\/\//, "")}</a>
          </p>
        ) : null}
        {doc.contact.available?.length ? (
          <>
            <p className="kicker">Available on request</p>
            <ul className="epk-available">
              {doc.contact.available.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </>
        ) : null}
        {doc.contact.legal ? <p className="status">{doc.contact.legal}</p> : null}
        <p className="epk-disclaimer">{doc.contact.disclaimer}</p>
        <p className="epk-nav__host">
          Hosted by Design Lab North
          <br />
          <a href="mailto:design@designlabnorth.com">design@designlabnorth.com</a>
        </p>
      </section>
    </>
  );
}
