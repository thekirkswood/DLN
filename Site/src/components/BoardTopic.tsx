"use client";

import { BoardTopic as SheetTopic } from "@/components/BoardSheet";
import { BoardMapping } from "@/components/BoardMapping";
import { BoardComms } from "@/components/BoardComms";
import { BoardProcess } from "@/components/BoardProcess";
import { BoardWorkbench } from "@/components/BoardWorkbench";
import { BoardIdentityFaculty } from "@/components/BoardIdentityFaculty";
import { BoardSolport } from "@/components/BoardSolport";
import { cellKind } from "@/data/board-kinds";
import type { Faculty } from "@/data/faculties";
import type { FrameworkTopic } from "@/data/framework-play";
import type { BoardLive } from "@/data/board-live";

export function BoardTopic({
  faculty,
  topic,
  live,
}: {
  faculty: Faculty;
  topic: FrameworkTopic;
  live: BoardLive | null;
}) {
  if (faculty.id === "mapping") {
    return <BoardMapping faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "process") {
    return <BoardProcess faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "workbench") {
    return <BoardWorkbench faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "identity") {
    return <BoardIdentityFaculty faculty={faculty} topic={topic} live={live} />;
  }
  if (faculty.id === "solport") {
    return <BoardSolport faculty={faculty} topic={topic} live={live} />;
  }
  const kind = cellKind(faculty.id, topic.id);
  if (kind === "sheet" || kind === "apes") {
    return <SheetTopic faculty={faculty} topicId={topic.id} live={live} />;
  }
  if (
    kind === "message" ||
    kind === "channel" ||
    kind === "comms-audience" ||
    kind === "spotlight"
  ) {
    return <BoardComms faculty={faculty} topic={topic} live={live} />;
  }
  return <SheetTopic faculty={faculty} topicId={topic.id} live={live} />;
}
