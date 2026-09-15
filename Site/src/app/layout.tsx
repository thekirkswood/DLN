import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { clientIpFrom } from "@/lib/client-ip";
import { ipIsBlocked } from "@/lib/block";
import { isLabHost } from "@/lib/lab-host";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Design Lab North",
    template: "%s · Design Lab North",
  },
  description:
    "We build, scale, and secure resilient brand identity presences on screen and in print.",
  metadataBase: new URL(process.env.DLN_PUBLIC_URL || "http://localhost:3010"),
  icons: {
    icon: "/brand/dln-mute.png",
  },
};

const groundBoot = `(function(){try{var g=localStorage.getItem("dln-ground");var ok={paper:1,ink:1,grey:1,mint:1,mist:1,cream:1,blush:1};document.documentElement.setAttribute("data-ground",ok[g]?g:"paper");localStorage.removeItem("dln-face");}catch(e){document.documentElement.setAttribute("data-ground","paper");}})();`;

function adobeKitHref(fromSettings = ""): string | null {
  const kit = (process.env.NEXT_PUBLIC_ADOBE_FONTS_KIT || fromSettings || "").trim();
  if (!/^[a-z0-9]{5,12}$/i.test(kit)) return null;
  return `https://use.typekit.net/${kit}.css`;
}

async function gateBlocked() {
  const path = headers().get("x-dln-path") || "";
  if (
    !path ||
    path === "/blocked" ||
    path.startsWith("/blocked/") ||
    path.startsWith("/api/")
  ) {
    return;
  }
  const user = await getSessionUser();
  if (user) return;
  if (await ipIsBlocked(clientIpFrom(headers()))) redirect("/blocked");
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await gateBlocked();
  const user = await getSessionUser();
  const studio = Boolean(user && isStudio(user));
  const lab = isLabHost(headers().get("x-forwarded-host") || headers().get("host"));
  const adobe = adobeKitHref((await getSettings()).adobeKit);
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        {adobe ? <link rel="stylesheet" href={adobe} /> : null}
        <script dangerouslySetInnerHTML={{ __html: groundBoot }} />
      </head>
      <body>
        <Header
          signedIn={Boolean(user)}
          studio={studio}
          lab={lab}
          userId={user?.id}
          hasAvatar={Boolean(user?.avatar)}
          displayName={user?.displayName}
        />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
