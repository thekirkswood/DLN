import Link from "next/link";
import { notFound } from "next/navigation";
import { plotBySlug, enterUrlFor, statusLabel } from "@/lib/plots";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { labHostFromHeaders, labStationPath } from "@/lib/lab";
import { EnsureHouse } from "@/components/EnsureHouse";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const plot = await plotBySlug(params.slug);
  return { title: plot ? plot.name : "Plot" };
}

export default async function PlotStoryPage({
  params,
}: {
  params: { slug: string };
}) {
  const plot = await plotBySlug(params.slug);
  if (!plot || !plot.public || plot.party !== "studio") notFound();
  const live = enterUrlFor(plot);
  const lab = labHostFromHeaders();
  const user = await getSessionUser();
  const studio = user ? isStudio(user) : false;
  const here =
    lab && plot.lab?.housePath ? labStationPath(plot.slug) : null;

  return (
    <article className="story-page wrap">
      {plot.logoPaper ? (
        <div className="story-mark">
          <img
            className="plot-mark plot-mark-paper"
            src={plot.logoPaper}
            alt={plot.name}
          />
          <img
            className="plot-mark plot-mark-ink"
            src={plot.logoInk || plot.logoPaper}
            alt=""
          />
        </div>
      ) : (
        <p className="wordmark">{plot.name}</p>
      )}
      <div className="status">{statusLabel(plot)}</div>
      <h1>{plot.name}</h1>
      <p className="story">{plot.voice}</p>
      {plot.betaContact ? (
        <p className="body beta-note">
          Open to beta testers — contact{" "}
          <a className="mail" href={`mailto:${plot.betaContact}`}>
            {plot.betaContact}
          </a>
        </p>
      ) : null}
      <div className="actions">
        {lab && studio && plot.lab?.housePath ? (
          <EnsureHouse slug={plot.slug} />
        ) : null}
        {here ? (
          <Link className="act act-fill" href={here}>
            Enter
          </Link>
        ) : live ? (
          <Link className="act act-fill" href={live}>
            Enter
          </Link>
        ) : null}
        {here && live ? (
          <Link className="act" href={live}>
            Live
          </Link>
        ) : null}
      </div>
    </article>
  );
}
