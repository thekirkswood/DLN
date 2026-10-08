import { BRAND_BITS_LEFT } from "@/data/campus";
import type { BoardSide } from "@/data/board-sheets";

export type CellRelated = {
  label: string;
  href: string;
  body: string;
};

export type CellSeat = {
  n: string;
  href: string;
  held: string;
};

export type BoardLive = {
  plot: string;
  plotName: string;
  status: string;
  hostUrl: string | null;
  cellKey: string;
  bitId?: string;
  held: string;
  lead: string;
  related: CellRelated[];
  snippets: Record<string, string>;
  seats?: CellSeat[];
  seat?: string;
};

const SIDE_READS: Record<BoardSide, string[]> = {
  identity: ["mission", "purpose", "promise", "positioning"],
  landscape: ["mission", "positioning", "location", "people"],
  object: ["mission", "purpose", "promise", "proposition"],
  process: ["mission", "people", "purpose"],
  think: ["mission", "personality", "people"],
  work: ["mission", "location"],
  sit: ["people", "mission", "location"],
};

const KEY_READS: Record<string, string[]> = {
  "plot:identity": ["mission", "personality", "brand-type"],
  "plot:mission": ["purpose", "vision", "promise"],
  "plot:vision": ["mission", "purpose", "big-idea"],
  "plot:proposition": ["value", "benefit", "positioning"],
  "plot:purpose": ["mission", "philosophy"],
  "plot:big-idea": ["mission", "positioning"],
  "plot:positioning": ["differentiation", "location", "brand-type"],
  "plot:differentiation": ["value", "features", "positioning"],
  "plot:value": ["benefit", "proposition", "promise"],
  "plot:brand-type": ["personality", "positioning"],
  "plot:promise": ["mission", "standards"],
  "plot:features": ["benefit"],
  "plot:benefit": ["features", "value"],
  "plot:location": ["people", "positioning"],
  "plot:people": ["founder", "location"],
  "plot:founder": ["people", "purpose"],
  "plot:personality": ["promise", "philosophy"],
  "plot:standards": ["ethics", "promise"],
  "plot:ethics": ["standards", "philosophy"],
  "plot:philosophy": ["purpose", "ethics"],
  "comms:message": ["mission", "promise", "proposition", "big-idea"],
  "comms:channel": ["location"],
  "comms:audience": ["people", "value", "benefit"],
  "comms:spotlight": ["promise", "mission"],
  "mapping:landscape": ["location", "positioning", "mission"],
  "mapping:relations": ["people", "location"],
  "mapping:evidence": ["standards"],
  "mapping:advocates": ["people", "founder"],
  "mapping:commentators": ["personality"],
  "mapping:trends": ["personality", "brand-type"],
  "mapping:cultural": ["personality", "philosophy", "ethics", "people"],
  "mapping:laws": ["ethics", "standards"],
  "mapping:opinion": ["promise", "personality"],
  "mapping:audience": ["people", "value", "benefit"],
  "process:stage-1": ["mission", "purpose"],
  "process:stage-2": ["people"],
  "process:stage-3": ["people", "location", "standards"],
  "process:stage-4": ["big-idea"],
  "process:stage-5": ["proposition", "positioning"],
  "process:stage-6": ["identity", "brand-type", "features"],
  "process:stage-7": ["location"],
  "process:stage-8": ["ethics", "standards"],
  "workbench:ideas": ["big-idea", "mission"],
  "workbench:host": ["location"],
  "identity:principles": ["standards", "ethics", "philosophy"],
  "identity:ethics": ["ethics", "standards"],
  "identity:toolkit": ["brand-type", "standards"],
  "identity:systems": ["identity", "brand-type"],
  "solport:sitting": ["people"],
  "solport:channels": ["location"],
  "solport:content": ["mission", "promise"],
};

export function bitIdFromCellKey(key: string): string | undefined {
  if (key.startsWith("plot:")) return key.slice(5);
  return undefined;
}

export function bitsThisCellReads(key: string, side: BoardSide): string[] {
  const listed = [...(KEY_READS[key] || []), ...SIDE_READS[side]];
  const self = bitIdFromCellKey(key);
  return [...new Set(listed)].filter((id) => id !== self);
}

export function withPlot(href: string, plot?: string): string {
  if (!plot) return href;
  const join = href.includes("?") ? "&" : "?";
  return `${href}${join}plot=${encodeURIComponent(plot)}`;
}

export function bitHref(id: string, plot?: string): string {
  return withPlot(`/board/plot/${id}`, plot);
}

export function cellHref(key: string, plot?: string): string {
  if (key.startsWith("plot:")) return bitHref(key.slice(5), plot);
  const [faculty, topic] = key.split(":");
  if (faculty && topic) return withPlot(`/board/${faculty}/${topic}`, plot);
  if (faculty) return withPlot(`/board/${faculty}`, plot);
  return withPlot("/board", plot);
}

export function emptyLead(plotName: string, cellName: string, hasRelated: boolean): string {
  if (hasRelated) {
    return `${plotName} has not written ${cellName} yet. What the plot already holds still speaks here.`;
  }
  return `${plotName} has nothing on ${cellName} yet. Add what belongs on this cell. Do not invent a line.`;
}

export function isKnownBitId(id: string): boolean {
  return BRAND_BITS_LEFT.some((b) => b.id === id);
}
