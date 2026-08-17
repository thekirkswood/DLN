import { redirect } from "next/navigation";
import { plotBySlug, enterUrlFor } from "@/lib/plots";
import { getSessionUser } from "@/lib/session";
import { canAccessPlot, isStudio } from "@/lib/auth";
import { plotShutFor } from "@/lib/billing";

export const metadata = { title: "Plot" };

export default async function PreviewPage({
  params,
}: {
  params: { slug: string };
}) {
  const plot = await plotBySlug(params.slug);
  if (!plot) redirect("/");
  const user = await getSessionUser();
  if (!user) redirect("/");
  if (!canAccessPlot(user, plot.slug)) redirect("/not-yours");
  if (!isStudio(user) && (await plotShutFor(plot.slug))) redirect("/not-yours");
  const live = enterUrlFor(plot);
  if (live) redirect(live);
  redirect(`/greenhouse/${plot.slug}`);
}
