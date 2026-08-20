import type { Stage } from "@/data/catalogue";

export type HostId = "dave" | "ewan";

export const HOSTS: Record<
  HostId,
  { id: HostId; name: string; email: string; facets: Stage[] }
> = {
  dave: {
    id: "dave",
    name: "Dave Kirkwood",
    email: "dave@designlabnorth.com",
    facets: ["design", "strategy"],
  },
  ewan: {
    id: "ewan",
    name: "Ewan Kirkwood",
    email: "ewan@designlabnorth.com",
    facets: ["build"],
  },
};

export function hostForFacet(facet: Stage, override?: HostId): HostId {
  if (override) return override;
  return facet === "build" ? "ewan" : "dave";
}

export type Hours = {
  days: number[];
  start: string;
  end: string;
  slotMinutes: number;
  /** ymd dates closed on top of the weekday pattern. */
  closedDates: string[];
  /** ymd dates opened on a weekday that is usually off. */
  openDates: string[];
  /** Slot start ISOs closed inside an open day. */
  blocked: string[];
};

export type HoursBook = Record<HostId, Hours>;

export type Booking = {
  id: string;
  hostId: HostId;
  facet: Stage;
  startIso: string;
  endIso: string;
  userId: string | null;
  invoiceId: string | null;
  status: "booked" | "hold" | "cancelled";
  createdAt: string;
  note?: string;
};

export type SlotState = "open" | "taken" | "held" | "blocked" | "off" | "past";

export type Slot = {
  startIso: string;
  endIso: string;
  hostId: HostId;
  open: boolean;
  state: SlotState;
  bookingId?: string;
};
