import { prisma } from "@/lib/cms";
import { notFound, redirect } from "next/navigation";
import { sendWelcomeEmail } from "@/lib/mail";

export default async function VerifyNewsletterPage({ searchParams }: { searchParams: Promise<{ token: string }> }) {
  const { token } = await searchParams;
  if (!token) notFound();

  const subscriber = await (prisma as any).newsletter.findUnique({
    where: { verificationToken: token }
  });

  if (!subscriber) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 italic">
        <div className="text-center p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
           <h1 className="text-3xl font-black uppercase tracking-tighter text-rose-600">Geçersiz Tokat</h1>
           <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-2">Bu doğrulama linki artık geçersiz veya süresi dolmuş.</p>
        </div>
      </div>
    );
  }

  await (prisma as any).newsletter.update({
    where: { id: subscriber.id },
    data: { status: "ACTIVE", verificationToken: null }
  });

  await sendWelcomeEmail(subscriber.email);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 italic">
      <div className="text-center p-16 bg-white rounded-[3rem] shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-500">
         <div className="w-20 h-20 bg-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-600/20">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
         </div>
         <h1 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">Aboneliğiniz <br/><span className="text-emerald-600">Onaylandı</span></h1>
         <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mt-6">Artık en güncel haberlerden ilk siz haberdar olacaksınız.</p>
         <a href="/" className="inline-block mt-10 px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-colors">Siteye Dön</a>
      </div>
    </div>
  );
}
