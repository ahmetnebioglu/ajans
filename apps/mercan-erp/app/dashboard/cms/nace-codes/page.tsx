import { getNaceCodes } from "../../../actions/cms-actions";
import { NaceCodesTable } from "./NaceCodesTable";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function NaceCodesManagementPage() {
  const codes = await getNaceCodes();

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 italic font-medium">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
           <Link href="/dashboard/cms" className="flex items-center gap-2 text-slate-400 hover:text-emerald-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-2 group">
              <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> CMS Hub
           </Link>
           <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              NACE <span className="text-emerald-600">Kodları</span>
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-widest">
              Tehlike Sınıfları listesini yönetin ve güncelleyin
           </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-sm overflow-hidden">
        <NaceCodesTable initialData={codes} />
      </div>
    </div>
  );
}
