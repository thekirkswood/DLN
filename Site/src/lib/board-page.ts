import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { boardApiStatus } from "@/lib/board-gate";
import type { PublicUser } from "@/lib/auth";

export async function requireBoardStudio(next = "/board"): Promise<PublicUser> {
  const host = headers().get("x-forwarded-host") || headers().get("host");
  const user = await getSessionUser();
  const gate = boardApiStatus(user, host);
  if (gate === 404) notFound();
  if (gate === 401 || !user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}
