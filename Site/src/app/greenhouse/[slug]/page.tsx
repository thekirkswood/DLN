import Link from "next/link";
import { notFound } from "next/navigation";
import { plotBySlug } from "@/lib/plots";
import { getSessionUser } from "@/lib/session";
import { canAccessPlot } from "@/lib/auth";

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
  if (!plot || !plot.public) notFound();
  const user = await getSessionUser();
  const allowed = user ? canAccessPlot(user, plot.slug) : false;
  const host = plot.hosts[0];
  const live = host ? `http://${host}` : null;

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
      ) : null}
      <div className="status">{plot.status}</div>
      <h1>{plot.name}</h1>
      <p className="story">{plot.voice}</p>
      {live ? (
        <div className="actions">
          {allowed ? (
            <Link className="act act-fill" href={live}>
              Enter the plot
            </Link>
          ) : user ? (
            <span className="note">This plot isn’t on your account.</span>
          ) : (
            <Link className="act act-line" href={`/login?next=/greenhouse/${plot.slug}`}>
              Sign in if this is yours
            </Link>
          )}
        </div>
      ) : null}
    </article>
  );
}
