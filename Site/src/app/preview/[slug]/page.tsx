import { redirect } from "next/navigation";
import { plotBySlug } from "@/lib/plots";
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

  return (
    <section className="section wrap">
      <div className="status">local preview · {plot.slug}</div>
      <div className="preview-frame">
        <div>
          <strong>{plot.name}</strong>
          <p>
            The plot container will sit here on the VPS at{" "}
            {plot.hosts[0] || `${plot.slug}.designlabnorth.com`}. This path is
            the offline stand-in while we build on this machine.
          </p>
        </div>
      </div>
    </section>
  );
}
