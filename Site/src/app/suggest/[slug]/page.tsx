import { notFound } from "next/navigation";
import { plotBySlug } from "@/lib/plots";
import { LiveSuggest } from "@/components/LiveSuggest";

export const dynamic = "force-dynamic";

export default async function SuggestPlot({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { embed?: string };
}) {
  const plot = await plotBySlug(params.slug);
  if (!plot || plot.party !== "client") notFound();
  return (
    <section className="wrap suggest-page">
      <LiveSuggest
        plotSlug={plot.slug}
        plotName={plot.name}
        embed={searchParams.embed === "1"}
      />
    </section>
  );
}
