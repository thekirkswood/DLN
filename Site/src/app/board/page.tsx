import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { canAccessPlot, isStudio } from "@/lib/auth";
import { clientPlots } from "@/lib/plots";
import { boardView, plotForUser } from "@/lib/board";
import { boardApiStatus } from "@/lib/board-gate";
import { BrandBoard } from "@/components/BrandBoard";

export const metadata = { title: "Board" };
export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { plot?: string };
}) {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  const gate = boardApiStatus(user, host);
  if (gate === 404) notFound();
  if (gate === 401 || !user) redirect("/login?next=/board");
  const plot = await plotForUser(user, searchParams.plot || "");
  if (!plot) {
    return (
      <article className="house-stage wrap">
        <p className="house-word">Board</p>
        <h1>No plot on this account yet.</h1>
        <p className="house-line">
          When a site is on the book, this is the communal game view for the
          brand. Studio still work from campus.
        </p>
      </article>
    );
  }
  const board = await boardView(user, plot);
  if (!board) redirect("/not-yours");
  const plots = (await clientPlots())
    .filter((p) => canAccessPlot(user, p.slug))
    .map((p) => ({ slug: p.slug, name: p.name }));
  return (
    <BrandBoard initial={board} plots={plots} studio={isStudio(user)} />
  );
}
