import { CampusPipeline, QualityFilter } from "@/components/MethodGraphics";
import { RuunPapers } from "@/components/RuunPapers";

export const metadata = { title: "Methodology" };

const SCALE = ["The", "same", "method", "at", "every", "scale"];

export default function MethodPage() {
  return (
    <>
      <RuunPapers />
      <article className="method wrap method-after-papers">
      <p className="kicker">Methodology</p>
      <h1>How we work</h1>
      <p className="lede">
        Design Lab North are an independent design and build institute, based
        on a campus in the Anglo-Scottish borders. We architect identities,
        sites, and commerce channels that have to last — for leaders who want
        velocity, certainty, and proof. Awards and clicks are not the score.
        Permanent, systemic adoption is.
      </p>

      <div className="method-pair">
        <div>
          <h2 className="method-peers">
            Peers, <span className="not-line">not</span> turf
          </h2>
          <p>
            If you already have an agency, an in-house team, or a trusted
            marketing squad, they come onto campus as peers. We do not run
            us-versus-them. We work with them — their insight, our lab — so the
            capital investment holds.
          </p>
        </div>
        <div>
          <h2 className="method-scale-head">
            {SCALE.map((word, i) => (
              <span key={word} style={{ fontSize: `${1.08 + i * 0.13}rem` }}>
                {word}{" "}
              </span>
            ))}
          </h2>
          <p className="method-scale-a">
            A regional business and a global one get the same institutional-grade
            rigour.
          </p>
          <p className="method-scale-b">
            The laws of the lab do not shift with the size of the balance sheet.
          </p>
        </div>
      </div>

      <h2 className="method-block">The quality filter</h2>
      <p>
        Every project runs through three dimensions of value: clean, enduring,
        resource-efficient. We reject the ugly, the wasteful, and the grab for
        attention. Bad design is bad business.
      </p>
      <QualityFilter />

      <h2 className="method-block">The campus pipeline</h2>
      <p>
        Work moves from a first sitting into a live host through four campus
        rooms. Hosting is a relationship — we can pull the work back into the
        lab without breaking live trade.
      </p>
      <CampusPipeline />

      <section className="method-vt">
        <div className="method-vt-mark">
          <img
            className="plot-mark plot-mark-paper"
            src="/plots/various-titles.png"
            alt=""
          />
          <img
            className="plot-mark plot-mark-ink"
            src="/plots/various-titles-white.png"
            alt=""
          />
        </div>
        <div>
          <h2 className="method-own">Various Titles</h2>
          <p>
            The engine room of the campus. A paywalled repository of operational
            method, identity blueprints, and communication frameworks. Studio
            clients get unhindered access. Corporate teams and agency peers
            subscribe. The point: a team can scale on the same blueprints
            without being forced to keep an agency on the job.
          </p>
        </div>
      </section>
    </article>
    </>
  );
}
