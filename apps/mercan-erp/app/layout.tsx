import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mercan ERP | İş Sağlığı ve Güvenliği",
  description: "İş sağlığı ve güvenliği süreçleri yönetim paneli.",
};

import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="antialiased font-medium italic">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
