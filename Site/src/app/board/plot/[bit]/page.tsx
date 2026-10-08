import { notFound, redirect } from "next/navigation";
import { requireBoardStudio } from "@/lib/board-page";
import { isPlotBitId } from "@/data/board-sheets";
import { boardEnterHref } from "@/lib/board-enter";

export const dynamic = "force-dynamic";

export default async function BoardPlotBitPage({
  params,
  searchParams,
}: {
  params: { bit: string };
  searchParams: { plot?: string };
}) {
  await requireBoardStudio(`/board/plot/${params.bit}`);
  if (!isPlotBitId(params.bit)) notFound();
  redirect(boardEnterHref(`plot:${params.bit}`, searchParams.plot));
}
