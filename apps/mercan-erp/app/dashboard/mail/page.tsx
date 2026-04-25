export default function MailPage() {
  return (
    <div className="p-4 space-y-4 animate-in fade-in duration-500 font-medium italic">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white leading-none">
          MAIL / WORKSPACE <span className="text-blue-600">YÖNETİMİ</span>
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          50 personel için Google Workspace hesap yönetimi ve güvenlik denetimi.
        </p>
      </div>
      
      <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-slate-200 dark:border-zinc-800 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b dark:border-zinc-800">
            <tr>
              <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Ad Soyad</th>
              <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Email</th>
              <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400">Durum</th>
              <th className="px-4 py-2.5 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-zinc-800">
            <tr className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors">
              <td className="px-4 py-3 text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Ahmet Yılmaz</td>
              <td className="px-4 py-3 text-xs font-mono text-blue-600 dark:text-blue-400 tracking-tighter">ahmet@mercan.com.ts</td>
              <td className="px-4 py-3">
                 <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase border border-emerald-100 dark:border-emerald-900/50 rounded-[4px]">AKTİF</span>
              </td>
              <td className="px-4 py-3 text-right">
                <button className="px-3 py-1 bg-zinc-900 dark:bg-blue-600 text-white rounded-[4px] text-[8px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">ŞİFRE SIFIRLA</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
