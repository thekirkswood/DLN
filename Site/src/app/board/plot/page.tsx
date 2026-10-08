import Link from "next/link";
import { redirect } from "next/navigation";
import { canAccessPlot, isStudio } from "@/lib/auth";
import { clientPlots } from "@/lib/plots";
import { boardView, plotForUser } from "@/lib/board";
import { requireBoardStudio } from "@/lib/board-page";
import { withPlot } from "@/data/board-live";
import { boardEnterHref } from "@/lib/board-enter";
import { BoardChrome } from "@/components/BoardChrome";

export const metadata = { title: "Plot · Board" };
export const dynamic = "force-dynamic";

function wantsBook(book?: string | string[]) {
  if (Array.isArray(book)) return book.includes("1");
  return book === "1";
}

export default async function BoardPlotPage({
  searchParams,
}: {
  searchParams: { plot?: string; book?: string | string[] };
}) {
  const user = await requireBoardStudio("/board/plot");
  const plot = await plotForUser(user, searchParams.plot || "");
  const plots = (await clientPlots())
    .filter((p) => canAccessPlot(user, p.slug))
    .map((p) => ({ slug: p.slug, name: p.name }));

  if (!plot) {
    redirect(boardEnterHref("plot"));
  }

  const board = await boardView(user, plot);
  if (!board) redirect("/not-yours");

  if (wantsBook(searchParams.book)) {
    const { BrandBoard } = await import("@/components/BrandBoard");
    return (
      <div className="board-shell">
        <BoardChrome current="plot" plot={plot} />
        <div className="board-book">
          <p className="board-book-back">
            <Link href={withPlot("/board/plot", plot)}>The plot</Link>
          </p>
          <BrandBoard initial={board} plots={plots} studio={isStudio(user)} />
        </div>
      </div>
    );
  }

  redirect(boardEnterHref("plot", plot));
}
