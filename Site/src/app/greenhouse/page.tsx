import { publicPlots } from "@/lib/plots";
import { PlotRow } from "@/components/PlotRow";
import { getSessionUser } from "@/lib/session";
import Link from "next/link";

export const metadata = { title: "Greenhouse" };

export default async function GreenhousePage() {
  const plots = await publicPlots();
  const user = await getSessionUser();
  return (
    <section className="section wrap" style={{ paddingTop: "4.2rem" }}>
      <p className="kicker">Greenhouse</p>
      <h1 className="page-title">What is growing.</h1>
      <p className="lede" style={{ marginBottom: "2.4rem" }}>
        Work in progress — new sites, rebuilds, and facelifts. If a plot is
        yours, open it from here. If it isn’t, you’ll meet it from our side.
        {user ? (
          <>
            {" "}
            <Link href="/logout">Sign out</Link>.
          </>
        ) : null}
      </p>
      <div className="plot-list">
        {plots.map((plot) => (
          <PlotRow key={plot.slug} plot={plot} />
        ))}
      </div>
    </section>
  );
}
