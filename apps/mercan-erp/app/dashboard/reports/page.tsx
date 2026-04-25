import React, { Suspense } from "react";
import { 
  FileBox, 
} from "lucide-react";
import { getReports } from "../../actions/admin-actions";
import ReportsTable from "../../components/ReportsTable";
import SearchInput from "../../components/SearchInput";

interface PageProps {
  searchParams: Promise<{ q?: string; sort?: string; dir?: "asc" | "desc" }>;
}

export default async function ReportsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams.q || "";
  const sort = resolvedParams.sort || "createdAt";
  const dir = resolvedParams.dir || "desc";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 font-medium italic">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic flex items-center justify-center md:justify-start gap-3 uppercase">
               <FileBox className="text-indigo-600 dark:text-indigo-400" size={32} />
               Rapor <span className="text-indigo-600">Arşivi</span>
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Tüm saha operasyonlarının merkezi veri noktası.</p>
        </div>

        {/* Search Engine (Client Side) */}
        <div className="w-full md:w-80">
           <Suspense fallback={<div className="h-10 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-[4px]" />}>
              <SearchInput defaultValue={query} placeholder="Rapor veya firma ara..." />
           </Suspense>
        </div>
      </div>

      {/* Reports Table Wrapped in Suspense */}
      <Suspense fallback={
        <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-zinc-200 dark:border-zinc-800 shadow-2xl p-12 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Veriler Hazırlanıyor...</p>
        </div>
      }>
        <ReportsList query={query} sort={sort} dir={dir} />
      </Suspense>
    </div>
  );
}

async function ReportsList({ query, sort, dir }: { query: string; sort: string; dir: "asc" | "desc" }) {
  const res = await getReports(query, sort, dir);
  const reports = res.success ? res.data : [];

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-[4px] border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
      <div className="p-8 border-b border-zinc-50 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-800/20 italic">
         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Rapor Listesi</p>
      </div>
      {!res.success ? (
         <div className="p-12 text-center text-rose-500 font-bold uppercase italic tracking-widest leading-loose">
            Veriler Alınırken Bir Hata Oluştu. <br/>
            <span className="text-slate-400 dark:text-slate-500 text-xs">{res.error}</span>
         </div>
      ) : (
         <ReportsTable initialReports={reports} currentSort={sort} currentDir={dir} />
      )}
    </div>
  );
}
