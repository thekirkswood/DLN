import { cookies, headers } from "next/headers";
import { epkCookieFields } from "@/lib/cookie-opts";
import { canEditKit, canViewKit, getEpkKit, isKitId } from "@/lib/epk";
import { getSessionUser } from "@/lib/session";
import { isStudio, type PublicUser } from "@/lib/auth";

export type KitAccess = {
  kit: string;
  user: PublicUser | null;
  studio: boolean;
  tagged: boolean;
  journalist: boolean;
  allowed: boolean;
  canEdit: boolean;
};

export async function kitAccess(kit: string): Promise<KitAccess> {
  const id = kit.toLowerCase();
  const user = await getSessionUser();
  const studio = Boolean(user && isStudio(user));
  const tagged = Boolean(user && !studio && canViewKit(user, id));
  const journalist = (await getEpkKit()) === id;
  const allowed = studio || tagged || journalist;
  return {
    kit: id,
    user,
    studio,
    tagged,
    journalist,
    allowed,
    canEdit: canEditKit(user, id),
  };
}

/** Set the press cookie so this kit stays open while they walk it. */
export function writeKitCookie(kit: string) {
  if (!isKitId(kit)) return;
  const h = headers();
  const host = h.get("x-forwarded-host") || h.get("host");
  const proto = h.get("x-forwarded-proto");
  const named = epkCookieFields(kit, host, proto);
  const opts = {
    httpOnly: named.httpOnly,
    sameSite: named.sameSite,
    path: named.path,
    maxAge: named.maxAge,
    expires: named.expires,
    secure: named.secure,
  };
  cookies().set(
    named.name,
    named.value,
    named.domain ? { ...opts, domain: named.domain } : opts,
  );
  if (named.domain) {
    cookies().set(named.name, "", { ...opts, maxAge: 0, expires: new Date(0) });
  }
}
