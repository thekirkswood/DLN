import { notFound, redirect } from "next/navigation";
import { requireBoardStudio } from "@/lib/board-page";
import { boardTopic, isBoardAvenueId } from "@/data/board-map";
import { boardEnterHref } from "@/lib/board-enter";

export const dynamic = "force-dynamic";

export default async function BoardTopicPage({
  params,
  searchParams,
}: {
  params: { avenue: string; topic: string };
  searchParams: { plot?: string; seat?: string };
}) {
  await requireBoardStudio(`/board/${params.avenue}/${params.topic}`);
  if (!isBoardAvenueId(params.avenue) || !boardTopic(params.avenue, params.topic)) notFound();
  const seat = searchParams.seat?.trim();
  const key =
    params.avenue === "mapping" && params.topic === "audience" && seat
      ? `mapping:audience:${seat}`
      : `${params.avenue}:${params.topic}`;
  redirect(boardEnterHref(key, searchParams.plot));
}
