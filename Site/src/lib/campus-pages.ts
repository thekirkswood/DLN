/** Stable page ids for campus notes. Same field clients send from a live-host well. */

export type CampusPage = { id: string; label: string };

export const CAMPUS_PAGES: CampusPage[] = [
  { id: "/admin", label: "Campus" },
  { id: "/lab?desk=clients", label: "Clients" },
  { id: "/lab?desk=onboarding", label: "Onboarding" },
  { id: "/lab?desk=book", label: "Book" },
  { id: "/lab?desk=pay", label: "Pay" },
  { id: "/lab?desk=settings", label: "Settings" },
  { id: "/", label: "Home" },
  { id: "/method", label: "Methodology" },
  { id: "/practice", label: "Practice" },
  { id: "/work", label: "Work" },
  { id: "/greenhouse", label: "Greenhouse" },
];

export function campusPageId(
  desk: string,
  who?: string | null,
): string {
  const q = new URLSearchParams();
  q.set("desk", desk);
  if (who) q.set("who", who);
  return `/lab?${q.toString()}`;
}

export function campusPageLabel(page: string | undefined | null): string {
  if (!page) return "";
  const exact = CAMPUS_PAGES.find((p) => p.id === page);
  if (exact) return exact.label;
  try {
    const u = new URL(page, "http://campus.local");
    const desk = u.searchParams.get("desk");
    const room = CAMPUS_PAGES.find((p) => p.id === `/lab?desk=${desk}`);
    if (room) return room.label;
  } catch {
    /* */
  }
  return page;
}
