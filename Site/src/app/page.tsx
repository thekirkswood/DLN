import Link from "next/link";
import { publicPlots } from "@/lib/plots";
import { Mark } from "@/components/Mark";

export default async function HomePage() {
  const plots = await publicPlots();
  return (
    <>
      <section className="hero wrap">
        <div className="hero-mark">
          <Mark size="hero" />
        </div>
        <p className="kicker">Design Lab North</p>
        <h1>Brand, sites, and the work that has to hold.</h1>
        <p className="lede">
          A studio in the north. We design identities and the places they live
          online, then host them while they grow — so a client can walk the
          rooms before the building is theirs.
        </p>
        <div className="hero-links">
          <Link className="act act-fill" href="/practice">
            The practice
          </Link>
          <Link className="act act-line" href="/greenhouse">
            Greenhouse
          </Link>
        </div>
      </section>
      {plots.length > 0 && (
        <section className="section wrap">
          <h2>Currently growing</h2>
          <div className="plot-list">
            {plots.map((plot) => (
              <Link
                key={plot.slug}
                className="plot-card"
                href={`/greenhouse/${plot.slug}`}
              >
                <h3>{plot.name}</h3>
                <div className="status">{plot.status}</div>
                <p>{plot.voice}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
