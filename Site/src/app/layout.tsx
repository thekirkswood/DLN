import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/session";

const tstar = localFont({
  src: [
    { path: "../../public/fonts/T-Star-Light.woff2", weight: "300", style: "normal" },
    { path: "../../public/fonts/T-Star-Medium.woff2", weight: "500", style: "normal" },
    { path: "../../public/fonts/T-Star-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/T-Star-Heavy.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-tstar",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Design Lab North",
    template: "%s · Design Lab North",
  },
  description:
    "A north studio for brand, websites, and the work that has to hold.",
  metadataBase: new URL(process.env.DLN_PUBLIC_URL || "http://localhost:3010"),
  icons: {
    icon: "/brand/dln-ink.png",
  },
};

const groundBoot = `(function(){try{var g=localStorage.getItem("dln-ground");if(g==="ink"||g==="paper")document.documentElement.setAttribute("data-ground",g);}catch(e){}})();`;

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const user = await getSessionUser();
  return (
    <html lang="en-GB" data-ground="paper" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: groundBoot }} />
      </head>
      <body className={`${tstar.variable} ${tstar.className}`}>
        <Header user={user} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
