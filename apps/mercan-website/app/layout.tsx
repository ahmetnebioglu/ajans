import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { GoogleTagManager } from '@next/third-parties/google';
import "./globals.css";
import Header from "../components/layout/Header";
import Footer from "../components/layout/SiteFooter";
import CookieConsent from "../components/layout/CookieConsent";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mercan OSGB | İş Sağlığı ve Güvenliği Çözümleri",
  description: "Türkiye genelinde 2.500'den fazla firma Mercan OSGB güvencesiyle risklerini minimize ediyor.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID || "";

  return (
    <html lang="tr" className={cn("scroll-smooth", "font-sans", geist.variable)}>
      <body className={`${inter.className} antialiased bg-white text-slate-900`}>
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
        <CookieConsent />
        {gtmId && <GoogleTagManager gtmId={gtmId} />}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
