import Link from "next/link";
import { publicPlots } from "@/lib/plots";
import { PlotRow } from "@/components/PlotRow";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const plots = await publicPlots();
  const user = await getSessionUser();
  return (
    <>
      <section className="hero wrap">
        <p className="kicker">Design Lab North</p>
        <h1>A design hub for brands that need a proper next step.</h1>
        <p className="lede">
          Identities, marketing principles, redesigns, facelifts, and the
          websites that have to carry them. We make the work here, grow it in
          the greenhouse, then move it onto a home of its own.
        </p>
        <div className="hero-links">
          <Link className="act act-fill" href="/practice">
            The practice
          </Link>
          <Link className="act act-line" href="/greenhouse">
            Greenhouse
          </Link>
          {user ? (
            <Link className="act act-line" href="/logout">
              Sign out
            </Link>
          ) : (
            <Link className="act act-line" href="/login">
              Sign in
            </Link>
          )}
        </div>
      </section>
      {plots.length > 0 && (
        <section className="section wrap">
          <h2>Currently growing</h2>
          <div className="plot-list">
            {plots.map((plot) => (
              <PlotRow key={plot.slug} plot={plot} compact />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
