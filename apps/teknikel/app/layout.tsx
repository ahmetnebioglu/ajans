import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import MainLayout from "@/components/layout/MainLayout";

export const metadata: Metadata = {
  title: "Teknikel Kombi Yedek Parça Yönetim",
  description: "Advanced Lead Generation & Management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="font-sans antialiased text-slate-800">
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
