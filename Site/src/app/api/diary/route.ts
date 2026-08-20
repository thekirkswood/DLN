import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession } from "@/lib/auth";
import {
  bookingsForUser,
  cancelBooking,
  getHours,
  hostForFacet,
  placeBooking,
  saveHours,
  slotsForHost,
  weekGrid,
  type HostId,
} from "@/lib/diary";
import { londonStartOfDay } from "@/lib/clock";
import type { Stage } from "@/data/catalogue";

export async function GET(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  const url = req.nextUrl;
  const mine = url.searchParams.get("mine");
  if (mine) {
    if (!user) return NextResponse.json({ ok: false }, { status: 401 });
    const rows = await bookingsForUser(user.id);
    return NextResponse.json({ ok: true, bookings: rows });
  }
  const from = url.searchParams.get("from") || londonStartOfDay();
  const facet = url.searchParams.get("facet");
  if (facet === "design" || facet === "strategy" || facet === "build") {
    const host = hostForFacet(facet);
    const slots = await slotsForHost(host, from, 14);
    return NextResponse.json({ ok: true, host, slots });
  }
  const studio = Boolean(user && isStudio(user));
  const grid = await weekGrid(from, studio);
  return NextResponse.json({
    ok: true,
    days: grid.days,
    hosts: grid.hosts,
    bookings: studio
      ? grid.bookings
      : grid.bookings.map((b) => ({
          ...b,
          userId: user && b.userId === user.id ? b.userId : null,
          invoiceId: null,
          note: b.status === "hold" ? "Held" : "Booked",
        })),
    hours: await getHours(),
  });
}

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  const body = (await req.json().catch(() => null)) as {
    action?: string;
    startIso?: string;
    facet?: Stage;
    invoiceId?: string;
    hostId?: HostId;
    userId?: string;
    hold?: boolean;
    note?: string;
    id?: string;
    hours?: Parameters<typeof saveHours>[1];
  } | null;
  if (!body) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    if (body.action === "hours") {
      if (!isStudio(user) || !body.hours) return NextResponse.json({ ok: false }, { status: 400 });
      const hours = await saveHours(user, body.hours);
      return NextResponse.json({ ok: true, hours });
    }
    if (body.action === "cancel" && body.id) {
      const row = await cancelBooking(user, body.id);
      return NextResponse.json({ ok: true, booking: row });
    }
    if (!body.startIso || !body.facet) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }
    const row = await placeBooking(user, {
      startIso: body.startIso,
      facet: body.facet,
      invoiceId: body.invoiceId,
      hostId: body.hostId,
      userId: body.userId,
      hold: Boolean(body.hold) && isStudio(user),
      note: body.note,
    });
    return NextResponse.json({ ok: true, booking: row });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status =
      msg === "forbidden" ? 403 : msg === "taken" || msg === "pay" || msg === "used" || msg === "shut" ? 409 : 400;
    return NextResponse.json({ ok: false, error: msg }, { status });
  }
}
