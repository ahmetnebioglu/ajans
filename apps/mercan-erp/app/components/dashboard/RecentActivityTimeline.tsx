"use client";

import React from "react";
import { 
  Upload, 
  Move, 
  RefreshCw, 
  FolderPlus, 
  User as UserIcon,
  Clock,
  Building2
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: Date;
  user: { name: string | null };
  company: { name: string } | null;
}

export default function RecentActivityTimeline({ logs }: { logs: any[] }) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "UPLOADED": return <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Upload size={14} /></div>;
      case "MOVED": return <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><Move size={14} /></div>;
      case "STATUS_CHANGED": return <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg"><RefreshCw size={14} /></div>;
      case "CREATED_FOLDER": return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg"><FolderPlus size={14} /></div>;
      default: return <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-lg"><Clock size={14} /></div>;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="py-10 text-center text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 italic tracking-[0.2em]">
         Henüz işlem kaydı bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-4 before:w-[1px] before:bg-slate-100 dark:before:bg-slate-800 font-medium italic transition-colors">
      {logs.map((log) => (
        <div key={log.id} className="relative pl-12 group">
           <div className="absolute left-0 top-0 z-10 transform group-hover:scale-110 transition-transform">
              {getActionIcon(log.action)}
           </div>
           
           <div className="space-y-1">
              <div className="flex items-center justify-between gap-4">
                 <div className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {log.user?.name || "Bilinmeyen Uzman"}
                 </div>
                 <div className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1 leading-none">
                    <Clock size={10} /> 
                    {isMounted ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                 </div>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                 {log.details}
              </p>
              
              {log.company && (
                 <div className="flex items-center gap-1.5 mt-2">
                    <Building2 size={10} className="text-slate-200 dark:text-slate-700" />
                    <span className="text-[9px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-widest leading-none">{log.company.name}</span>
                 </div>
              )}
           </div>
        </div>
      ))}
    </div>
  );
}
