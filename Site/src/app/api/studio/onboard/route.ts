import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { COOKIE, isStudio, userFromSession, createClient } from "@/lib/auth";
import { allPlots } from "@/lib/plots";
import { enquiryById, markEnquiryOnboarded } from "@/lib/enquiries";
import { localHandleFromName } from "@/lib/handles";
import { sendStudioMail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const user = await userFromSession(cookies().get(COOKIE)?.value);
  if (!user || !isStudio(user)) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as {
    email?: string;
    displayName?: string;
    password?: string;
    plots?: string[];
    personalEmail?: string;
    phone?: string;
    notes?: string;
    enquiryId?: string;
    usePersonalLogin?: boolean;
  } | null;

  let displayName = body?.displayName?.toString().trim() || "";
  let personalEmail = body?.personalEmail?.toString().trim().toLowerCase() || "";
  let phone = body?.phone?.toString().trim() || "";
  let notes = body?.notes?.toString().trim() || "";
  const enquiryId = body?.enquiryId?.toString().trim() || "";

  if (enquiryId) {
    const enquiry = await enquiryById(enquiryId);
    if (!enquiry) return NextResponse.json({ ok: false }, { status: 400 });
    displayName = displayName || enquiry.name;
    personalEmail = personalEmail || enquiry.email;
    phone = phone || enquiry.phone || "";
    notes =
      notes ||
      [enquiry.needLabel, enquiry.message].filter(Boolean).join("\n");
  }

  const usePersonal = Boolean(body?.usePersonalLogin) && Boolean(personalEmail);
  const email =
    body?.email?.toString().trim().toLowerCase() ||
    (usePersonal ? personalEmail : localHandleFromName(displayName));

  const plots = Array.isArray(body?.plots) ? body.plots.map(String) : [];
  const known = new Set((await allPlots()).map((p) => p.slug));
  const bound = plots.filter((s) => known.has(s));

  try {
    const created = await createClient({
      email,
      displayName,
      plots: bound,
      personalEmail: personalEmail || undefined,
      phone: phone || undefined,
      notes: notes || undefined,
      enquiryId: enquiryId || undefined,
    });
    if (enquiryId) {
      await markEnquiryOnboarded(enquiryId).catch(() => undefined);
    }
    const mailbox = created.user.personalEmail || personalEmail;
    const signIn = process.env.DLN_PUBLIC_URL?.trim() || "https://designlabnorth.com";
    const mailed = mailbox
      ? await sendStudioMail({
          to: mailbox,
          subject: "Your Design Lab North login",
          text: [
            `Hello ${created.user.displayName},`,
            "",
            "Here is your Design Lab North login. The same address opens Various Titles when you are on that book.",
            "",
            `Sign in: ${signIn.replace(/\/$/, "")}/login`,
            `Login: ${created.user.email}`,
            `Password: ${created.password}`,
            "",
            "Design Lab North",
          ].join("\n"),
        })
      : false;
    return NextResponse.json({
      ok: true,
      id: created.user.id,
      email: created.user.email,
      password: created.password,
      personalEmail: mailbox || null,
      mailed,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    const status = msg === "exists" ? 409 : 400;
    return NextResponse.json({ ok: false }, { status });
  }
}
