"use client";

import React, { useState, useEffect } from "react";
import { 
  ExternalLink, 
  Calendar,
  User as UserIcon,
  Building2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  ChevronsUpDown,
  Eye,
  Trash2,
  CheckSquare,
  X,
  Loader2
} from "lucide-react";
import { updateReportStatus, bulkUpdateReportStatus, bulkDeleteReports } from "../actions/admin-actions";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import FilePreview from "./dashboard/FilePreview";

interface ReportsTableProps {
  initialReports: any[];
  currentSort?: string;
  currentDir?: "asc" | "desc";
}

export default function ReportsTable({ 
  initialReports, 
  currentSort = "createdAt", 
  currentDir = "desc" 
}: ReportsTableProps) {
  const [reports, setReports] = useState(initialReports);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<any>(null);
  
  // SELECTION STATE
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkModal, setShowBulkModal] = useState<"status" | "delete" | null>(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkNewStatus, setBulkNewStatus] = useState("COZULDU");

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  useEffect(() => { setReports(initialReports); }, [initialReports]);

  // SELECTION HANDLERS
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) setSelectedIds([]);
    else setSelectedIds(reports.map(r => r.id));
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const res = await updateReportStatus(id, newStatus);
    if (res.success) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    }
    setUpdatingId(null);
  };

  const handleBulkStatusUpdate = async () => {
    setIsBulkProcessing(true);
    const res = await bulkUpdateReportStatus(selectedIds, bulkNewStatus);
    if (res.success) {
      setSelectedIds([]);
      setShowBulkModal(null);
      router.refresh();
    }
    setIsBulkProcessing(false);
  };

  const handleBulkDelete = async () => {
    setIsBulkProcessing(true);
    const res = await bulkDeleteReports(selectedIds);
    if (res.success) {
      setSelectedIds([]);
      setShowBulkModal(null);
      router.refresh();
    }
    setIsBulkProcessing(false);
  };

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const newDir = (currentSort === field && currentDir === "asc") ? "desc" : "asc";
    params.set("sort", field);
    params.set("dir", newDir);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const SortHeader = ({ field, label }: { field: string, label: string }) => {
    const isActive = currentSort === field;
    return (
      <th onClick={() => handleSort(field)} className="p-4 cursor-pointer group hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-colors">
        <div className="flex items-center gap-2">
           <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>{label}</span>
           {isActive ? (currentDir === "asc" ? <ArrowUp size={12} className="text-blue-600 dark:text-blue-400" /> : <ArrowDown size={12} className="text-blue-600 dark:text-blue-400" />) : <ChevronsUpDown size={12} className="text-slate-300 dark:text-slate-700 opacity-0 group-hover:opacity-100" />}
        </div>
      </th>
    );
  };

  const bgStatus = (status: string) => {
    switch (status) {
      case "AKSIYON_GEREKLI": return "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50";
      case "COZULDU": return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      default: return "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    }
  };

  if (reports.length === 0) return <div className="p-20 text-center text-slate-400 font-black italic uppercase tracking-widest leading-loose">Sonuç Bulunamadı.</div>;

  return (
    <div className="relative">
        <div className="overflow-x-auto text-sm italic font-medium">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                        <th className="p-8 w-10">
                           <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded-[4px] border-zinc-200 dark:border-zinc-800 bg-transparent text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedIds.length === reports.length && reports.length > 0}
                            onChange={toggleSelectAll}
                           />
                        </th>
                        <SortHeader field="title" label="Rapor Bilgisi" />
                        <SortHeader field="company" label="Firma" />
                        <SortHeader field="status" label="Durum" />
                        <SortHeader field="createdAt" label="Tarih" />
                        <th className="p-8 text-[9px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest text-right">İşlemler</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {reports.map((report) => (
                    <tr key={report.id} className={`group transition-all duration-300 ${selectedIds.includes(report.id) ? "bg-blue-50/50 dark:bg-blue-900/20" : "hover:bg-slate-50/50 dark:hover:bg-zinc-800/30"}`}>
                        <td className="p-8 w-10">
                           <input 
                            type="checkbox" 
                            className="w-4 h-4 rounded-[4px] border-zinc-200 dark:border-zinc-800 bg-transparent text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={selectedIds.includes(report.id)}
                            onChange={() => toggleSelect(report.id)}
                           />
                        </td>
                        <td className="p-8">
                            <div className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{report.title}</div>
                            <div className="text-[9px] font-bold text-slate-300 dark:text-slate-500 mt-1 uppercase tracking-tighter italic">{report.category}</div>
                        </td>
                        <td className="p-8 text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase italic opacity-70 group-hover:opacity-100">{report.company?.name}</td>
                        <td className="p-8">
                            <div className={`px-3 py-1 rounded-[4px] border text-[9px] font-black uppercase tracking-widest w-fit shadow-sm ${bgStatus(report.status)}`}>
                                {report.status?.replace("_", " ")}
                            </div>
                        </td>
                        <td className="p-8 text-[10px] font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap italic"><Calendar size={12} className="inline mr-1" /> {new Date(report.createdAt).toLocaleDateString("tr-TR")}</td>
                        <td className="p-8 text-right">
                           <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setPreviewFile(report)} className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-[4px] hover:bg-blue-600 hover:text-white transition-all shadow-sm"><Eye size={16} /></button>
                              <a href={report.fileUrl} target="_blank" className="p-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-[4px] hover:bg-blue-600 transition-all shadow-md"><ExternalLink size={16} /></a>
                           </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {/* FLOATING ACTION BAR */}
        {selectedIds.length > 0 && (
           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[300] animate-in slide-in-from-bottom-10 duration-500">
              <div className="bg-slate-900 text-white px-8 py-5 rounded-[4px] shadow-[0_20px_50px_rgba(0,0,0,0.4)] border border-slate-800 flex items-center gap-8 backdrop-blur-md italic font-medium">
                 <div className="flex items-center gap-3 pr-8 border-r border-slate-700">
                    <div className="w-10 h-10 bg-blue-600 rounded-[4px] flex items-center justify-center font-black text-lg shadow-lg">{selectedIds.length}</div>
                    <span className="text-xs font-black uppercase tracking-widest">Dosya Seçildi</span>
                 </div>
                 
                 <div className="flex items-center gap-3">
                    <button 
                     onClick={() => setShowBulkModal("status")}
                     className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                       <CheckSquare size={16} className="text-emerald-400" /> Toplu Durum Değiştir
                    </button>
                    <button 
                     onClick={() => setShowBulkModal("delete")}
                     className="flex items-center gap-2 px-6 py-2.5 bg-rose-500/20 hover:bg-rose-500 text-rose-100 rounded-[4px] text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                       <Trash2 size={16} /> Toplu Sil
                    </button>
                    <button onClick={() => setSelectedIds([])} className="p-2.5 text-slate-500 hover:text-white transition-colors border-l border-slate-700 ml-2"><X size={18} /></button>
                 </div>
              </div>
            </div>
         )}
        {showBulkModal === "status" && (
           <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[4px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 border dark:border-slate-800">
                 <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">TOPLU STATÜ</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{selectedIds.length} DOSYA GÜNCELLENECEK</p>
                 </div>
                 <div className="grid grid-cols-1 gap-2">
                    {["BEKLEMEDE", "AKSIYON_GEREKLI", "COZULDU"].map((s) => (
                       <button key={s} onClick={() => setBulkNewStatus(s)} className={`p-4 rounded-[4px] border-2 text-[10px] font-black uppercase tracking-widest transition-all ${bulkNewStatus === s ? "bg-blue-50 dark:bg-blue-900/30 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-md" : "border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600"}`}>
                          {s.replace("_", " ")}
                       </button>
                    ))}
                 </div>
                 <div className="flex gap-2 pt-4">
                    <button onClick={() => setShowBulkModal(null)} className="flex-1 p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-600">Vazgeç</button>
                    <button onClick={handleBulkStatusUpdate} disabled={isBulkProcessing} className="flex-2 p-4 bg-blue-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                       {isBulkProcessing ? <Loader2 className="animate-spin" size={14} /> : "GÜNCELLEMEYİ ONAYLA"}
                    </button>
                 </div>
              </div>
           </div>
        )}

         {showBulkModal === "delete" && (
           <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[4px] shadow-2xl p-10 space-y-8 animate-in zoom-in-95 border-t-8 border-rose-600 dark:border-rose-500 shadow-[0_20px_50px_rgba(244,63,94,0.15)]">
                 <div className="text-center space-y-2">
                    <h3 className="text-3xl font-black italic uppercase tracking-tighter text-rose-600 dark:text-rose-400 leading-none">TOPLU SİLME</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold leading-relaxed uppercase tracking-widest px-4">{selectedIds.length} Adet rapor sistemden kalıcı olarak temizlenecektir.</p>
                 </div>
                 <div className="flex gap-2">
                    <button onClick={() => setShowBulkModal(null)} className="flex-1 p-4 text-[10px] font-black uppercase text-slate-400 dark:text-slate-600">İptal</button>
                    <button onClick={handleBulkDelete} disabled={isBulkProcessing} className="flex-2 p-4 bg-rose-600 text-white rounded-[4px] text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2">
                       {isBulkProcessing ? <Loader2 className="animate-spin" size={14} /> : "KALICI OLARAK SİL"}
                    </button>
                 </div>
              </div>
           </div>
        )}

        <FilePreview isOpen={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} />
    </div>
  );
}
