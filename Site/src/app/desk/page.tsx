import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home book" };

export default async function DeskPage({
  searchParams,
}: {
  searchParams: { desk?: string; who?: string };
}) {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/desk");
  if (!isStudio(user)) notFound();
  const q = new URLSearchParams();
  if (searchParams.desk) q.set("desk", searchParams.desk);
  if (searchParams.who) q.set("who", searchParams.who);
  const qs = q.toString();
  redirect(qs ? `/account?${qs}` : "/account");
}
