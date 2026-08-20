import { headers } from "next/headers";
import { plotByHost, plotBySlug } from "@/lib/plots";
import { LiveSuggest } from "@/components/LiveSuggest";

export const dynamic = "force-dynamic";

export default async function SuggestIndex({
  searchParams,
}: {
  searchParams: { embed?: string };
}) {
  const host = headers().get("x-forwarded-host") || headers().get("host") || "";
  const plot = (await plotByHost(host)) || (await plotBySlug("modyu"));
  if (!plot || plot.party !== "client") {
    return (
      <section className="wrap suggest-page">
        <p className="body">No suggestion well on this host.</p>
      </section>
    );
  }
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
