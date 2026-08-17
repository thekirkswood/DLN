import { createTransport } from "nodemailer";

/** Returns true if a message left. No SMTP → false, never throws. */
export async function sendStudioMail(opts: {
  to: string;
  subject: string;
  text: string;
  replyTo?: string;
}): Promise<boolean> {
  const host = process.env.DLN_SMTP_HOST?.trim();
  if (!host) return false;
  const to = opts.to.trim();
  if (!to) return false;
  const from =
    process.env.DLN_ENQUIRE_FROM?.trim() ||
    process.env.DLN_ENQUIRE_TO?.trim() ||
    "build@designlabnorth.com";
  const port = Number(process.env.DLN_SMTP_PORT || "587");
  const user = process.env.DLN_SMTP_USER?.trim();
  const pass = process.env.DLN_SMTP_PASS?.trim();
  try {
    const transport = createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
    await transport.sendMail({
      from,
      to,
      replyTo: opts.replyTo,
      subject: opts.subject,
      text: opts.text,
    });
    return true;
  } catch {
    return false;
  }
}
