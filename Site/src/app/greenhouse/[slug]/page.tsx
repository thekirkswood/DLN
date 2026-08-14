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

  return (
    <article className="story-page wrap">
      <div className="status">{plot.status}</div>
      <h1>{plot.name}</h1>
      <p className="story">{plot.voice}</p>
      <div className="actions">
        {allowed ? (
          <Link className="act act-fill" href={plot.localPreview}>
            Enter the plot
          </Link>
        ) : user ? (
          <span className="note">This plot isn’t on your account.</span>
        ) : (
          <Link className="act act-line" href={`/login?next=/preview/${plot.slug}`}>
            Sign in if this is yours
          </Link>
        )}
      </div>
    </article>
  );
}
