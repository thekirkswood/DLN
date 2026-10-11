/**
 * Legacy plot handoff helpers. ModYu EPK now lives on the hub at /epk/modyu
 * like every other house — no external press origin.
 */

export const KIT_EXTERNAL_PRESS: Record<string, string> = {};

export function kitExternalOrigin(_kit: string): string | null {
  return null;
}

/** @deprecated ModYu no longer hands off to the plot. */
export async function kitHandoffHref(
  _kit: string,
  _nextPath = "/epk",
): Promise<string | null> {
  return null;
}
