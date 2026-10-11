/** Hub base for the ModYu bespoke press kit. */
export const MODYU_EPK_BASE = "/epk/modyu";

export function modyuEpkPath(rest = ""): string {
  const tail = rest.replace(/^\/+/, "");
  return tail ? `${MODYU_EPK_BASE}/${tail}` : MODYU_EPK_BASE;
}
