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
  
  // Server-side fetch with query and sorting
  const res = await getReports(query, sort, dir);
  const reports = res.success ? res.reports : [];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic flex items-center justify-center md:justify-start gap-3">
               <FileBox className="text-indigo-600 dark:text-indigo-400" size={36} />
               Rapor Arşivi
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Tüm saha operasyonlarının merkezi veri noktası.</p>
        </div>

        {/* Search Engine (Client Side) */}
        <div className="w-full md:w-80">
           <Suspense fallback={<div className="h-12 w-full bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />}>
              <SearchInput defaultValue={query} placeholder="Rapor veya firma ara..." />
           </Suspense>
        </div>
      </div>

      {/* Reports Table Integrated with Workflow & Dynamic Sorting */}
      <div className="bg-white dark:bg-slate-900 rounded-[0.75rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden min-h-[400px]">
        {!res.success ? (
           <div className="p-20 text-center text-rose-500 font-bold uppercase italic tracking-widest leading-loose">
              Veriler Alınırken Bir Hata Oluştu. <br/>
              <span className="text-slate-400 dark:text-slate-500 text-xs">{res.error}</span>
           </div>
        ) : (
           <ReportsTable initialReports={reports} currentSort={sort} currentDir={dir} />
        )}
      </div>
    </div>
  );
}
