"use client";

import { BoardAvenue as SheetAvenue } from "@/components/BoardSheet";
import type { Faculty } from "@/data/faculties";
import type { BoardLive } from "@/data/board-live";

export function BoardAvenue({
  faculty,
  live,
}: {
  faculty: Faculty;
  live: BoardLive | null;
}) {
  return <SheetAvenue faculty={faculty} live={live} />;
}
