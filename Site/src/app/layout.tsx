import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LabHubDock } from "@/components/LabHubDock";
import { getSessionUser } from "@/lib/session";
import { isStudio } from "@/lib/auth";
import { labHostFromHeaders } from "@/lib/lab";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const blender = localFont({
  src: [
    { path: "../../public/fonts/Blender-Book.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Blender-BookItalic.woff2", weight: "400", style: "italic" },
    { path: "../../public/fonts/Blender-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/Blender-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Blender-Strong.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-blender",
  display: "swap",
});

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

const groundBoot = `(function(){try{var g=localStorage.getItem("dln-ground");document.documentElement.setAttribute("data-ground",g==="ink"?"ink":"paper");}catch(e){document.documentElement.setAttribute("data-ground","paper");}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  const lab = labHostFromHeaders();
  const studio = Boolean(user && isStudio(user));
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: groundBoot }} />
      </head>
      <body className={`${blender.variable} ${blender.className}`}>
        <Header signedIn={Boolean(user)} studio={studio} lab={lab} />
        <main>{children}</main>
        {lab && studio ? <LabHubDock /> : null}
        <Footer />
      </body>
    </html>
  );
}
