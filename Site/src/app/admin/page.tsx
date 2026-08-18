import Link from "next/link";
import { requireLabStudioPage } from "@/lib/lab-guard";
import { LabDesk } from "@/components/LabDesk";

export const metadata = { title: "Campus building site" };
export const dynamic = "force-dynamic";

export default async function HubAdminPage() {
  await requireLabStudioPage("/admin");
  return (
    <>
      <LabDesk plot="dln" houseName="Design Lab North" />
      <p className="wrap lab-back">
        <Link href="/lab">Campus</Link>
        {" · "}
        <Link href="/">The public site</Link>
      </p>
    </>
  );
}
