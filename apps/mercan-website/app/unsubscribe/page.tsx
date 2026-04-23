import { prisma } from "@/lib/cms";
import { notFound } from "next/navigation";

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ email: string }> }) {
  const { email } = await searchParams;
  if (!email) notFound();

  await (prisma as any).newsletter.update({
    where: { email },
    data: { status: "UNSUBSCRIBED" }
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 italic">
      <div className="text-center p-16 bg-white rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
         <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Abonelikten <br/><span className="text-rose-600">Çıkıldı</span></h1>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-6">Sizi aramızda tekrar görmek dileğiyle.</p>
         <a href="/" className="inline-block mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Siteye Dön</a>
      </div>
    </div>
  );
}
