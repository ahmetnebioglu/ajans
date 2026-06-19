import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ERP Unified OS | İş Yönetim Platformu",
  description:
    "Drive, CMS, HR, CRM modülleriyle işletmenizi tek bir platformdan yönetin.",
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
