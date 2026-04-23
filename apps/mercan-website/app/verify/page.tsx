import VerificationHandler from "../../components/verify/VerificationHandler";
import { Sparkles, XCircle } from "lucide-react";

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; type?: string }>;
}) {
  const { token, type } = await searchParams;
  const requestType = type as "contact" | "reference";

  if (!token || !type) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] p-8">
        <div className="text-center space-y-4">
           <XCircle size={64} className="text-red-500 mx-auto" />
           <h1 className="text-2xl font-black text-white uppercase italic">GEÇERSİZ BAĞLANTI</h1>
           <p className="text-slate-400">Doğrulama linki hatalı veya süresi dolmuş.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F172A] relative overflow-hidden p-8">
      {/* Hero Style Background */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-0 right-[-15%] w-[60%] h-full bg-blue-500/[0.1] skew-x-[-20deg] origin-top border-l border-white/[0.05]" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
         <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 p-12 rounded-[2.5rem] text-center shadow-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-blue-500/20 rounded-full bg-blue-500/5 mb-8">
              <Sparkles size={12} className="text-blue-400" />
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] italic">
                &lt;SİSTEM DOĞRULAMA&gt;
              </span>
            </div>

            <VerificationHandler token={token} type={requestType} />
         </div>
      </div>
    </div>
  );
}
