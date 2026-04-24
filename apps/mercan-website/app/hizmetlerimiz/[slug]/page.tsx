import { prisma as db } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = await (db as any)?.service?.findUnique({
    where: { slug },
  });

  if (!service) return { title: "Hizmet Bulunamadı" };

  return {
    title: service.seoTitle || `${service.title} | Mercan OSGB`,
    description: service.seoDescription || service.summary || "",
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  console.log("SERVICE DETAIL - DB STATUS:", db ? "Defined" : "Undefined");
  if (db) {
    console.log("SERVICE DETAIL - MODELS:", Object.keys(db).filter(k => !k.startsWith("$")));
  }

  const service = await (db as any)?.service?.findUnique({
    where: { slug, isPublished: true },
  });

  if (!service) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 pt-20 pb-16">
      {/* Hero Section */}
      <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden bg-slate-900">
        {service.featuredImage ? (
          <Image
            src={`https://drive.google.com/thumbnail?id=${service.featuredImage}&sz=w1920`}
            alt={service.title}
            fill
            className="object-cover opacity-50"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-slate-50" />
        )}
        
        {/* Diagonal & Reflection Effects */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-200/60 skew-x-[-20deg] translate-x-24 -z-0" />
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/[0.05] rounded-full blur-[100px] -z-0" />
        
        <div className="absolute inset-0 border-b border-slate-100" />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-600/90 text-blue-100 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-blue-500/30 backdrop-blur-md mb-6">
            HİZMETLERİMİZ
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-slate-900 italic tracking-tighter max-w-4xl drop-shadow-lg">
            {service.title}
          </h1>
          {service?.summary && (
            <p className="mt-6 text-lg md:text-xl text-slate-600 font-medium italic max-w-2xl drop-shadow">
              {service.summary}
            </p>
          )}
        </div>
      </section>

      {/* Content Section */}
      <section className="container max-w-4xl mx-auto px-6 -mt-20 relative z-20 pb-16">
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 shadow-2xl border border-slate-100 prose prose-lg md:prose-xl max-w-none prose-headings:font-black prose-headings:italic prose-headings:tracking-tight prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-img:rounded-3xl prose-img:shadow-xl">
          <div dangerouslySetInnerHTML={{ __html: service.content }} />
        </div>
      </section>
    </main>
  );
}
