import { packSummary, readPack } from "@/lib/board-pack";
import type { BoardView } from "@/lib/board";
import type { ScaleId } from "@/data/campus";

/** Fill the overview table reads. Same keys as board-cell `snippetsFrom`. */
export type BoardSpaceFill = {
  plot: string;
  plotName: string;
  hostUrl: string | null;
  status: string;
  snippets: Record<string, string>;
  scale?: ScaleId | "";
};

function clip(body: string, n = 88): string {
  const text = body.trim();
  if (text.length <= n) return text;
  const cut = text.slice(0, n);
  const at = cut.lastIndexOf(" ");
  return `${(at > 40 ? cut.slice(0, at) : cut).trim()}…`;
}

function cellsOf(view: BoardView): Record<string, string> {
  const extra = view as BoardView & { cells?: Record<string, string> };
  if (!extra.cells || typeof extra.cells !== "object") return {};
  return extra.cells;
}

export function snippetsFromView(view: BoardView): Record<string, string> {
  const out: Record<string, string> = {};
  for (const bit of view.bitsLeft) {
    const body = bit.body.trim();
    if (body) out[`plot:${bit.id}`] = packSummary(body) || body;
  }
  for (const [key, raw] of Object.entries(cellsOf(view))) {
    const body = (raw || "").trim();
    if (body) out[key] = packSummary(body) || body;
  }
  return out;
}

export function spaceHero(snippets: Record<string, string>): string {
  const line =
    snippets["plot:mission"] || snippets["plot:purpose"] || snippets["plot:identity"] || "";
  return clip(line.split("\n")[0] || "", 160);
}

export function spaceSnip(snippets: Record<string, string>, key: string): string {
  const body = snippets[key]?.trim();
  if (!body) return "";
  return clip(body.split("\n")[0] || "", 88);
}

export function spaceHeld(snippets: Record<string, string>, key: string): boolean {
  return Boolean(snippets[key]?.trim());
}

export function spaceSeatName(snippets: Record<string, string>, n: string): string | undefined {
  const body = snippets[`mapping:audience:${n}`]?.trim();
  if (!body) return undefined;
  const name = body.split(" · ")[0]?.trim();
  return name || undefined;
}

export function spaceHost(url: string | null | undefined): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "");
}

export function spaceScaleFromView(view: BoardView): ScaleId | "" {
  const raw = cellsOf(view)["mapping:scale"] || "";
  const pack = readPack(raw);
  if (pack?.kind === "scale" && pack.scale) return pack.scale;
  return "";
}
