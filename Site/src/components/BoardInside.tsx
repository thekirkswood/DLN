"use client";

import { MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { facultyById } from "@/data/faculties";
import { boardTopic } from "@/data/board-map";
import type { BoardLive } from "@/data/board-live";
import type { BoardView } from "@/lib/board";
import type { BoardEnter } from "@/lib/board-enter";
import { boardEnterHref, enterKeyFromHref, isBoardTableHref } from "@/lib/board-enter";
import { BoardPlotBit } from "@/components/BoardPlotBit";
import { BoardMapping } from "@/components/BoardMapping";
import { BoardComms } from "@/components/BoardComms";
import { BoardProcess } from "@/components/BoardProcess";
import { BoardWorkbench } from "@/components/BoardWorkbench";
import { BoardApesTopic } from "@/components/BoardApesTopic";
import { BoardShowcase } from "@/components/BoardShowcase";
import { BoardSolport } from "@/components/BoardSolport";
import { BoardIdentityFaculty } from "@/components/BoardIdentityFaculty";
import { BoardTopic as SheetTopic } from "@/components/BoardSheet";

export function BoardInside({
  enter,
  live,
  view,
  plots,
}: {
  enter: BoardEnter;
  live: BoardLive | null;
  view: BoardView | null;
  plots: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const plot = live?.plot || view?.plot;

  function onWalk(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as HTMLElement).closest("a");
    if (!a) return;
    const href = a.getAttribute("href") || "";
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (/^https?:/i.test(href) && !href.includes("/board")) return;
    if (isBoardTableHref(href)) {
      e.preventDefault();
      router.push(boardEnterHref("", plot));
      return;
    }
    const key = enterKeyFromHref(href);
    if (!key) return;
    e.preventDefault();
    router.push(boardEnterHref(key, plot));
  }

  return (
    <div className="board-inside" onClick={onWalk}>
      <p className="board-inside-back">
        <Link href={boardEnterHref("", plot)} aria-label="Back to the table">
          <span className="board-inside-back-arr" aria-hidden="true" />
          The table
        </Link>
      </p>
      <Room enter={enter} live={live} view={view} plots={plots} />
    </div>
  );
}

function Room({
  enter,
  live,
  view,
  plots,
}: {
  enter: BoardEnter;
  live: BoardLive | null;
  view: BoardView | null;
  plots: { slug: string; name: string }[];
}) {
  if (enter.kind === "showcase") {
    return <BoardShowcase view={view} plots={plots} />;
  }
  if (enter.kind === "bit" && enter.bit) {
    const faculty = facultyById("identity");
    if (!faculty) return null;
    return <BoardPlotBit faculty={faculty} bit={enter.bit} live={live} />;
  }
  const faculty = enter.faculty ? facultyById(enter.faculty) : undefined;
  const topic = enter.faculty && enter.topic ? boardTopic(enter.faculty, enter.topic) : undefined;
  if (!faculty || !topic) return null;
  if (faculty.id === "mapping") {
    return <BoardMapping faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "comms") {
    return <BoardComms faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "process") {
    return <BoardProcess faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "workbench") {
    return <BoardWorkbench faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "apes") {
    return <BoardApesTopic faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "solport") {
    return <BoardSolport faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "identity") {
    return <BoardIdentityFaculty faculty={faculty} topic={topic} live={live} />;
  }
  return <SheetTopic faculty={faculty} topicId={topic.id} live={live} />;
}
