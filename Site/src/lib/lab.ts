import { headers } from "next/headers";
import { isLabHost } from "@/lib/lab-host";

export { isLabHost } from "@/lib/lab-host";

export function labHostFromHeaders(): boolean {
  return isLabHost(headers().get("host"));
}
