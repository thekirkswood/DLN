import { isLabHost } from "@/lib/lab-host";
import { isStudio, type PublicUser } from "@/lib/auth";

/** The framework board is campus studio only. It does not exist on the live host. */
export function boardOpenOnHost(host?: string | null): boolean {
  return isLabHost(host);
}

export function canOpenBoard(user: PublicUser | null | undefined, host?: string | null): boolean {
  return boardApiStatus(user, host) === "ok";
}

export function boardApiStatus(
  user: PublicUser | null | undefined,
  host?: string | null,
): 401 | 404 | "ok" {
  if (!boardOpenOnHost(host)) return 404;
  if (!user) return 401;
  if (!isStudio(user)) return 404;
  return "ok";
}

export function hostOf(req: { headers: { get: (name: string) => string | null } }): string | null {
  return req.headers.get("x-forwarded-host") || req.headers.get("host");
}
