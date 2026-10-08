import { CUSTOMER_SEATS } from "@/data/board-map";
import { packSummary } from "@/lib/board-pack";
import type { BoardSheet } from "@/data/board-sheets";
import {
  bitHref,
  bitIdFromCellKey,
  bitsThisCellReads,
  emptyLead,
  withPlot,
  type BoardLive,
  type CellRelated,
} from "@/data/board-live";
import { boardView, plotForUser, type BoardView } from "@/lib/board";
import type { PublicUser } from "@/lib/auth";

function clip(body: string, n = 420): string {
  const text = body.trim();
  if (text.length <= n) return text;
  const cut = text.slice(0, n);
  const at = cut.lastIndexOf(" ");
  return `${(at > 80 ? cut.slice(0, at) : cut).trim()}…`;
}

function snippetsFrom(view: BoardView): Record<string, string> {
  const out: Record<string, string> = {};
  for (const bit of view.bitsLeft) {
    if (bit.body.trim()) out[`plot:${bit.id}`] = packSummary(bit.body) || bit.body.trim();
  }
  for (const [key, body] of Object.entries(view.cells)) {
    if (body.trim()) out[key] = packSummary(body) || body.trim();
  }
  return out;
}

function heldFor(view: BoardView, key: string, seat?: string): string {
  if (seat && key === "mapping:audience") {
    return (view.cells[`mapping:audience:${seat}`] || "").trim();
  }
  const bitId = bitIdFromCellKey(key);
  if (bitId) {
    return (view.bitsLeft.find((b) => b.id === bitId)?.body || "").trim();
  }
  return (view.cells[key] || "").trim();
}

function relatedFor(view: BoardView, sheet: BoardSheet): CellRelated[] {
  const plot = view.plot;
  const rows: CellRelated[] = [];
  const seen = new Set<string>();
  const selfBit = bitIdFromCellKey(sheet.key);

  function push(label: string, href: string, body: string, id: string) {
    const text = body.trim();
    if (!text || seen.has(id)) return;
    seen.add(id);
    rows.push({ label, href, body: clip(text) });
  }

  for (const id of bitsThisCellReads(sheet.key, sheet.side)) {
    const bit = view.bitsLeft.find((b) => b.id === id);
    if (bit?.body.trim() && id !== selfBit) {
      push(bit.label, bitHref(id, plot), bit.body, `bit:${id}`);
    }
  }

  if (sheet.side === "work" || sheet.side === "process" || sheet.key.endsWith(":host")) {
    if (view.hostUrl) {
      push(
        "Live host",
        view.hostUrl,
        `${view.status} · ${view.hostUrl.replace(/^https?:\/\//, "")}`,
        "host"
      );
    }
    const plan = view.plans.find((p) => p.status === "ready") || view.plans[0];
    if (plan) {
      push(
        plan.title,
        withPlot("/board/workbench/board", plot),
        plan.patchNotes || plan.status,
        `plan:${plan.id}`
      );
    }
  }

  if (sheet.side === "landscape" || sheet.side === "sit") {
    const note = view.notes[0];
    if (note?.body.trim()) {
      push(
        "On the book",
        withPlot("/board/workbench/board", plot),
        note.body,
        `note:${note.id}`
      );
    }
  }

  return rows.slice(0, 4);
}

export function liveFromView(
  sheet: BoardSheet,
  view: BoardView,
  opts?: { seat?: string }
): BoardLive {
  const seat = opts?.seat?.trim() || undefined;
  const cellKey =
    seat && sheet.key === "mapping:audience" ? `mapping:audience:${seat}` : sheet.key;
  const held = heldFor(view, sheet.key, seat);
  const related = relatedFor(view, sheet);
  const seats =
    sheet.key === "mapping:audience"
      ? CUSTOMER_SEATS.map((c) => ({
          n: c.n,
          href: `${c.href}${c.href.includes("?") ? "&" : "?"}plot=${encodeURIComponent(view.plot)}`,
          held: (view.cells[`mapping:audience:${c.n}`] || "").trim(),
        }))
      : undefined;

  return {
    plot: view.plot,
    plotName: view.plotName,
    status: view.status,
    hostUrl: view.hostUrl,
    cellKey,
    bitId: bitIdFromCellKey(sheet.key),
    held,
    lead: held || emptyLead(view.plotName, sheet.name, related.length > 0),
    related,
    snippets: snippetsFrom(view),
    seats,
    seat,
  };
}

export async function liveBoard(
  user: PublicUser,
  want?: string
): Promise<BoardView | null> {
  const plot = await plotForUser(user, want);
  if (!plot) return null;
  return boardView(user, plot);
}
