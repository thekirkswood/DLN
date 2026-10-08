import { redirect } from "next/navigation";
import { canAccessPlot } from "@/lib/auth";
import { clientPlots } from "@/lib/plots";
import { plotForUser } from "@/lib/board";
import { requireBoardStudio } from "@/lib/board-page";
import { liveBoard, liveFromView } from "@/lib/board-cell";
import { snippetsFromView, spaceScaleFromView } from "@/lib/board-space";
import { parseEnter } from "@/lib/board-enter";
import { plotBitSheet, topicSheet } from "@/data/board-sheets";
import type { FacultyId } from "@/data/faculties";
import { BoardChrome } from "@/components/BoardChrome";
import { BoardSpace } from "@/components/BoardSpace";
import { BoardInside } from "@/components/BoardInside";
import type { BoardLive } from "@/data/board-live";

export const metadata = { title: "Board" };
export const dynamic = "force-dynamic";

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { plot?: string; enter?: string };
}) {
  const user = await requireBoardStudio("/board");
  const plot = await plotForUser(user, searchParams.plot || "");
  const view = plot ? await liveBoard(user, plot) : null;
  if (plot && !view) redirect("/not-yours");
  const plots = (await clientPlots())
    .filter((p) => canAccessPlot(user, p.slug))
    .map((p) => ({ slug: p.slug, name: p.name }));
  const entered = parseEnter(searchParams.enter);
  let cellLive: BoardLive | null = null;
  if (view && entered?.kind === "bit" && entered.bit) {
    const sheet = plotBitSheet(entered.bit);
    cellLive = sheet ? liveFromView(sheet, view) : null;
  } else if (view && entered?.kind === "topic" && entered.faculty && entered.topic) {
    const sheet = topicSheet(entered.faculty as FacultyId, entered.topic);
    cellLive = sheet ? liveFromView(sheet, view, { seat: entered.seat }) : null;
  }

  return (
    <div className="board-shell">
      <BoardChrome
        current={entered?.faculty || (entered?.kind === "showcase" ? "plot" : "overview")}
        plot={plot || undefined}
      />
      <BoardSpace
        fill={
          view
            ? {
                plot: view.plot,
                plotName: view.plotName,
                hostUrl: view.hostUrl,
                status: view.status,
                snippets: snippetsFromView(view),
                scale: spaceScaleFromView(view),
              }
            : null
        }
        plots={plots}
        enterKey={entered?.key || null}
        enterRegion={entered?.region || null}
      >
        {entered ? (
          <BoardInside enter={entered} live={cellLive} view={view} plots={plots} />
        ) : null}
      </BoardSpace>
    </div>
  );
}
