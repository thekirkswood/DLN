import Link from "next/link";
import { BOARD_ROOMS } from "@/data/board-map";
import { avenueEnterHref, boardEnterHref } from "@/lib/board-enter";
import { PaperInkChips } from "@/components/GroundSwitch";

export function BoardChrome({
  current,
  plot,
}: {
  current: string;
  plot?: string;
}) {
  return (
    <nav className="board-chrome" aria-label="Board rooms">
      <Link href="/">Campus</Link>
      <Link
        className={current === "overview" ? "is-on" : undefined}
        href={boardEnterHref("", plot)}
        aria-current={current === "overview" ? "page" : undefined}
      >
        Overview
      </Link>
      {BOARD_ROOMS.map((room) => (
        <Link
          key={room.id}
          className={current === room.id ? "is-on" : undefined}
          href={avenueEnterHref(room.id, plot)}
          aria-current={current === room.id ? "page" : undefined}
        >
          <span className="board-chrome-n">{room.n}</span>
          {room.name}
        </Link>
      ))}
      <span className="board-chrome-ground">
        <PaperInkChips />
      </span>
    </nav>
  );
}
