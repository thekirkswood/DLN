import { headers } from "next/headers";
import { Workbench } from "@/components/Workbench";
import { isStudio } from "@/lib/auth";
import { isLabHost } from "@/lib/lab-host";
import { getSessionUser } from "@/lib/session";

export default async function HomePage() {
  const user = await getSessionUser();
  const host = headers().get("x-forwarded-host") || headers().get("host");
  return (
    <Workbench
      signedIn={Boolean(user)}
      userId={user?.id}
      displayName={user?.displayName}
      lab={isLabHost(host)}
      studio={Boolean(user && isStudio(user))}
    />
  );
}
