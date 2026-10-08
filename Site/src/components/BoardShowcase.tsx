import Link from "next/link";
import {
  CUSTOMER_SEATS,
  LANDSCAPE_TOKENS,
  PROCESS_STEPS,
} from "@/data/board-map";
import { bitHref, withPlot } from "@/data/board-live";
import type { BoardView } from "@/lib/board";
import {
  snippetsFromView,
  spaceHeld,
  spaceHero,
  spaceHost,
  spaceSeatName,
  spaceSnip,
} from "@/lib/board-space";
import { BoardAssetsStrip } from "@/components/BoardAssetsStrip";
import "./BoardShowcase.css";

const IDENTITY_SLOTS = [
  { id: "identity", label: "Identity statements" },
  { id: "mission", label: "Mission" },
  { id: "purpose", label: "Purpose" },
  { id: "positioning", label: "Positioning" },
] as const;

type SlotDoor = {
  href: string;
  label: string;
  held: boolean;
  snip: string;
};

function Slot({ href, label, held, snip }: SlotDoor) {
  return (
    <Link
      href={href}
      className={`board-showcase-slot chamfer${held ? " is-held" : " is-hole"}`}
    >
      <span className="board-showcase-slot-name">{label}</span>
      {held && snip ? <span className="board-showcase-slot-snip">{snip}</span> : null}
    </Link>
  );
}

function landscapeDoor(snippets: Record<string, string>, plot?: string): SlotDoor {
  const hit = LANDSCAPE_TOKENS.find((t) => spaceHeld(snippets, `mapping:${t.id}`));
  if (hit) {
    return {
      href: withPlot(hit.href, plot),
      label: hit.label,
      held: true,
      snip: spaceSnip(snippets, `mapping:${hit.id}`),
    };
  }
  return {
    href: withPlot("/board/mapping", plot),
    label: "Landscape",
    held: false,
    snip: "",
  };
}

function seatDoors(snippets: Record<string, string>, plot?: string): SlotDoor[] {
  const named = CUSTOMER_SEATS.filter((c) =>
    spaceHeld(snippets, `mapping:audience:${c.n}`),
  );
  return [0, 1].map((i) => {
    const hit = named[i];
    if (hit) {
      const name = spaceSeatName(snippets, hit.n);
      return {
        href: withPlot(hit.href, plot),
        label: name || `Seat ${hit.n}`,
        held: true,
        snip: spaceSnip(snippets, `mapping:audience:${hit.n}`),
      };
    }
    const vacant = CUSTOMER_SEATS[i];
    return {
      href: withPlot(vacant.href, plot),
      label: `Seat ${vacant.n}`,
      held: false,
      snip: "",
    };
  });
}

function processDoor(snippets: Record<string, string>, plot?: string): SlotDoor {
  const hit = [...PROCESS_STEPS]
    .reverse()
    .find((s) => spaceHeld(snippets, `process:${s.id}`));
  if (hit) {
    return {
      href: withPlot(hit.href, plot),
      label: hit.short,
      held: true,
      snip: spaceSnip(snippets, `process:${hit.id}`),
    };
  }
  return {
    href: withPlot("/board/process", plot),
    label: "Process",
    held: false,
    snip: "",
  };
}

function heroKind(snippets: Record<string, string>): string {
  if (spaceHeld(snippets, "plot:mission")) return "Mission";
  if (spaceHeld(snippets, "plot:purpose")) return "Purpose";
  if (spaceHeld(snippets, "plot:identity")) return "Identity";
  return "";
}

export function BoardShowcase({
  view,
  plots = [],
}: {
  view: BoardView | null;
  plots?: { slug: string; name: string }[];
}) {
  const snippets = view ? snippetsFromView(view) : {};
  const plot = view?.plot;
  const hero = spaceHero(snippets);
  const kind = heroKind(snippets);
  const host = spaceHost(view?.hostUrl);
  const landscape = landscapeDoor(snippets, plot);
  const seats = seatDoors(snippets, plot);
  const process = processDoor(snippets, plot);

  return (
    <article className="board-showcase">
      <header className="board-showcase-head">
        <p className="kicker">00 · Plot</p>
        {plots.length > 1 ? (
          <div className="board-showcase-plots" role="group" aria-label="Plot on the table">
            {plots.map((p) => (
              <Link
                key={p.slug}
                href={`/board/plot?plot=${encodeURIComponent(p.slug)}`}
                className={plot === p.slug ? "is-on" : undefined}
                aria-current={plot === p.slug ? "page" : undefined}
              >
                {p.name}
              </Link>
            ))}
          </div>
        ) : null}
        <h1>{view?.plotName || "The thing itself"}</h1>
        {view ? (
          <p className="board-showcase-meta">
            <span>{view.status}</span>
            {view.hostUrl && host ? (
              <>
                {" · "}
                <a href={view.hostUrl} target="_blank" rel="noreferrer">
                  {host}
                </a>
              </>
            ) : null}
          </p>
        ) : (
          <p className="board-showcase-meta is-mute">Vacant</p>
        )}
      </header>

      <section
        className={`board-showcase-well${hero ? " is-held" : " is-empty"}`}
        aria-label="The thing itself"
      >
        <p className="kicker">{kind || "The thing itself"}</p>
        <p className={`board-showcase-hero${hero ? " is-line" : " is-vacant"}`}>
          {hero || "—"}
        </p>
        <span className="board-showcase-token" aria-hidden />
      </section>

      <nav className="board-showcase-ring" aria-label="What the book holds">
        {IDENTITY_SLOTS.map((bit) => (
          <Slot
            key={bit.id}
            href={bitHref(bit.id, plot)}
            label={bit.label}
            held={spaceHeld(snippets, `plot:${bit.id}`)}
            snip={spaceSnip(snippets, `plot:${bit.id}`)}
          />
        ))}
        <Slot {...landscape} />
        {seats.map((seat, i) => (
          <Slot key={`seat-${i}`} {...seat} />
        ))}
        <Slot {...process} />
      </nav>

      <section className="board-showcase-stills" aria-label="Stills">
        <BoardAssetsStrip plot={plot} />
        <div className="board-showcase-plates">
          {["a", "b", "c"].map((id) => (
            <div
              key={id}
              className="board-showcase-plate chamfer"
              aria-disabled="true"
            >
              <span className="kicker">Generated</span>
            </div>
          ))}
        </div>
      </section>

      {view ? (
        <p className="board-showcase-open">
          <Link href={withPlot("/board/plot?book=1", view.plot)}>Open the book</Link>
        </p>
      ) : null}
    </article>
  );
}
