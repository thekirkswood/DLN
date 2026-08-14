import { redirect } from "next/navigation";
import { plotBySlug, enterUrlFor } from "@/lib/plots";
import { getSessionUser } from "@/lib/session";
import { canAccessPlot } from "@/lib/auth";

export const metadata = { title: "Plot" };

export default async function PreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  const plot = await plotBySlug(params.slug);
  if (!plot) redirect("/greenhouse");
  const user = await getSessionUser();
  if (!user || !canAccessPlot(user, plot.slug)) {
    redirect(`/greenhouse/${plot.slug}`);
  }
  const live = enterUrlFor(plot);
  if (live) redirect(live);
  redirect(`/greenhouse/${plot.slug}`);
}
