import { homeDialSecret, homeOrigin, isHomeTicket } from "@/lib/home-ticket";
import type { PublicUser } from "@/lib/auth";

export async function issueStudioTicketFromHome(
  email: string,
  password: string,
): Promise<{ user: PublicUser; token: string } | { error: "home_unreachable" | "denied" } | null> {
  const origin = homeOrigin();
  const secret = homeDialSecret();
  if (!origin || !secret) return null;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 8000);
  try {
    const res = await fetch(`${origin}/api/auth/home-issue`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-DLN-Home-Dial": secret,
      },
      body: JSON.stringify({ email, password }),
      signal: ctrl.signal,
    });
    if (res.status === 401 || res.status === 403) return { error: "denied" };
    if (!res.ok) return { error: "home_unreachable" };
    const data = (await res.json().catch(() => null)) as {
      token?: string;
      user?: PublicUser;
    } | null;
    if (!data?.token || !data.user || !isHomeTicket(data.token)) {
      return { error: "home_unreachable" };
    }
    return { user: data.user, token: data.token };
  } catch {
    return { error: "home_unreachable" };
  } finally {
    clearTimeout(t);
  }
}
