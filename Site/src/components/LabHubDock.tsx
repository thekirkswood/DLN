"use client";

import { usePathname } from "next/navigation";
import { LabComment } from "@/components/LabComment";

export function LabHubDock() {
  const path = usePathname() || "/";
  if (
    path === "/lab" ||
    path.startsWith("/lab/") ||
    path === "/admin" ||
    path.startsWith("/admin/") ||
    path === "/login" ||
    path.startsWith("/go/")
  ) {
    return null;
  }
  return (
    <div className="lab-hub-dock wrap">
      <LabComment plot="dln" page={path} compact />
    </div>
  );
}
