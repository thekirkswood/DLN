import { notFound, redirect } from "next/navigation";
import { requireBoardStudio } from "@/lib/board-page";
import { isBoardAvenueId } from "@/data/board-map";
import { avenueEnterHref } from "@/lib/board-enter";

export const dynamic = "force-dynamic";

export default async function BoardAvenuePage({
  params,
  searchParams,
}: {
  params: { avenue: string };
  searchParams: { plot?: string };
}) {
  await requireBoardStudio(`/board/${params.avenue}`);
  if (!isBoardAvenueId(params.avenue)) notFound();
  redirect(avenueEnterHref(params.avenue, searchParams.plot));
}
