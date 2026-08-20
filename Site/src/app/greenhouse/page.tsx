import { greenhousePlots } from "@/lib/plots";
import { PlotRow } from "@/components/PlotRow";

export const metadata = { title: "Greenhouse" };

export default async function GreenhousePage() {
  const plots = await greenhousePlots();
  return (
    <section className="section wrap" style={{ paddingTop: "4.2rem" }}>
      <p className="kicker">Greenhouse</p>
      <h1 className="page-title">Greenhouse projects</h1>
      <div className="plot-list">
        {plots.map((plot) => (
          <PlotRow key={plot.slug} plot={plot} href={`/greenhouse/${plot.slug}`} />
        ))}
      </div>
    </section>
  );
}
