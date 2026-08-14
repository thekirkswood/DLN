import { cookies } from "next/headers";
import { userFromSession, COOKIE, type PublicUser } from "@/lib/auth";

export async function getSessionUser(): Promise<PublicUser | null> {
  const token = cookies().get(COOKIE)?.value;
  return userFromSession(token);
}
