import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LabHubDock } from "@/components/LabHubDock";
import { StudioPresence } from "@/components/StudioPresence";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { labHostFromHeaders } from "@/lib/lab";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "Design Lab North",
    template: "%s · Design Lab North",
  },
  description:
    "A north design hub for identities, marketing, redesigns, facelifts, and the sites that have to carry them.",
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  const lab = labHostFromHeaders();
  const studio = Boolean(user && isStudio(user));
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
        {lab && studio ? <StudioPresence /> : null}
        {lab && studio ? <LabHubDock /> : null}
        <Footer />
      </body>
    </html>
  );
}
