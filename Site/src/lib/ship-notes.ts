import { promises as fs } from "fs";
import path from "path";

export type ShipNote = {
  t: string;
  n: number;
  tag: string;
  kind?: string;
  s: string;
};

export async function listShipNotes(): Promise<ShipNote[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), "..", "memory", "ship-notes.jsonl"),
      "utf8",
    );
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as ShipNote)
      .filter((row) => row && row.tag);
  } catch {
    return [];
  }
}
