import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/cms/SectionRenderer";

// ISR (Incremental Static Regeneration) yapılandırması
// Sayfa arka planda her 60 saniyede bir statik olarak yenilenecek
export const revalidate = 60;

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DynamicPage(props: PageProps) {
  const params = await props.params;
  const { slug } = params;

  // 1 & 2. Geleneksel API yerine doğrudan veritabanına bağlanıp veri çekiyoruz (RSC)
  const pageData = await prisma.page.findFirst({
    where: {
      slug: slug,
      isPublished: true, // Sadece yayında olanları getir
    },
    include: {
      sections: {
        orderBy: {
          order: 'asc' // Sıra değerine göre artan sıralama
        }
      }
    }
  });

  // 4. Hata Yönetimi: Veritabanından sayfa dönmezse 404 sayfasına yönlendiriyoruz
  if (!pageData) {
    notFound();
  }

  // 5. Render: Çekilen sections verisini SectionRenderer'a iletiyoruz
  return (
    <main className="flex flex-col min-h-screen pt-32 pb-12 bg-white">
      {/* 
        Eğer page modelinde bir başlık veya açıklama göstermek isterseniz buraya eklenebilir. 
        Şimdilik tüm düzeni SectionRenderer'a bırakıyoruz.
      */}
      <SectionRenderer sections={pageData.sections as any} />
    </main>
  );
}
