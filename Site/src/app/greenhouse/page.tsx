import Link from "next/link";
import { publicPlots } from "@/lib/plots";

export const metadata = { title: "Greenhouse" };

export default async function GreenhousePage() {
  const plots = await publicPlots();
  return (
    <section className="section wrap" style={{ paddingTop: "4.2rem" }}>
      <p className="kicker">Greenhouse</p>
      <h1 className="page-title">What is growing.</h1>
      <p className="lede" style={{ marginBottom: "2.4rem" }}>
        Work in progress. If a plot is yours, sign in and it will open. If it
        isn’t, you’ll meet it from our side.
      </p>
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
  );
}
