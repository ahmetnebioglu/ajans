"use client";

import React, { useState, useTransition } from "react";
import { updateLeadStatus } from "@ajans/core";
import { 
  ChevronRight, 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  Tag, 
  ArrowRight,
  CheckCircle2,
  Clock,
  Send,
  XCircle
} from "lucide-react";

interface LeadWithActivity extends any {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  source: string;
  message: string;
  status: string;
  createdAt: string;
}

const COLUMNS = [
  { id: "NEW", title: "Yeni Talepler", color: "blue", icon: Clock },
  { id: "CONTACTED", title: "İletişime Geçildi", color: "indigo", icon: Phone },
  { id: "PROPOSAL_SENT", title: "Teklif Verildi", color: "amber", icon: Send },
  { id: "CLOSED_WON", title: "Anlaşma Tamam", color: "emerald", icon: CheckCircle2 },
  { id: "CLOSED_LOST", title: "Kaybedildi", color: "rose", icon: XCircle },
];

const COLUMN_STYLES: Record<string, any> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800",
};

export default function KanbanBoard({ initialLeads, tenantId, userId }: { initialLeads: LeadWithActivity[], tenantId: string, userId: string }) {
  const [leads, setLeads] = useState(initialLeads);
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, newStatus, tenantId, userId);
      if (res.success) {
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
      } else {
        alert("Durum güncellenirken bir hata oluştu.");
      }
    });
  };

  const getLeadsByStatus = (status: string) => leads.filter(l => l.status === status);

  return (
    <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-12 min-h-[600px] scrollbar-hide">
      {COLUMNS.map((col) => (
        <div key={col.id} className="flex-1 min-w-[320px] max-w-[400px] flex flex-col gap-5">
          {/* Column Header */}
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl shadow-inner ${COLUMN_STYLES[col.color].split(' ').slice(0, 3).join(' ')}`}>
                <col.icon size={18} />
              </div>
              <h3 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-sm">
                {col.title}
              </h3>
            </div>
            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              {getLeadsByStatus(col.id).length}
            </span>
          </div>

          {/* Column Body */}
          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/30 rounded-[2.5rem] p-4 border border-slate-100/50 dark:border-slate-800/50 space-y-4">
            {getLeadsByStatus(col.id).length === 0 ? (
              <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Kayıt Bulunmuyor</span>
              </div>
            ) : (
              getLeadsByStatus(col.id).map((lead) => (
                <LeadCard 
                  key={lead.id} 
                  lead={lead} 
                  onStatusChange={(status) => handleStatusChange(lead.id, status)}
                  isPending={isPending}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function LeadCard({ lead, onStatusChange, isPending }: { lead: LeadWithActivity, onStatusChange: (status: string) => void, isPending: boolean }) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all group relative overflow-hidden">
      {/* Source Tag */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 rounded-full">
           <Tag size={10} className="text-blue-600" />
           <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{lead.source}</span>
        </div>
        <button 
          onClick={() => setShowActions(!showActions)}
          className="text-slate-400 hover:text-blue-600 transition-colors"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Customer Info */}
      <div className="space-y-4">
        <div>
          <h4 className="font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-base leading-tight group-hover:text-blue-600 transition-colors">
            {lead.fullName}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
            <Calendar size={10} />
            {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
          </p>
        </div>

        {/* Message Preview */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
           <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed italic font-medium">
             "{lead.message}"
           </p>
        </div>

        {/* Contact Links */}
        <div className="flex items-center gap-4 pt-2">
           <div className="flex items-center gap-1.5 text-slate-400">
             <Mail size={14} className="group-hover:text-blue-500 transition-colors" />
             <span className="text-[10px] font-bold truncate max-w-[120px]">{lead.email}</span>
           </div>
           {lead.phone && (
             <div className="flex items-center gap-1.5 text-slate-400">
               <Phone size={14} className="group-hover:text-emerald-500 transition-colors" />
               <span className="text-[10px] font-bold">{lead.phone}</span>
             </div>
           )}
        </div>
      </div>

      {/* Status Change Popover/Overlay */}
      {showActions && (
        <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 space-y-3 animate-in fade-in zoom-in duration-200">
           <h5 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-2">Statüyü Güncelle</h5>
           <div className="grid grid-cols-1 w-full gap-2">
              {COLUMNS.filter(c => c.id !== lead.status).map(col => (
                <button 
                  key={col.id}
                  onClick={() => { onStatusChange(col.id); setShowActions(false); }}
                  disabled={isPending}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-blue-600 hover:border-blue-500 transition-all text-left"
                >
                   <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">{col.title}</span>
                   <ArrowRight size={14} className="text-slate-500" />
                </button>
              ))}
              <button 
                onClick={() => setShowActions(false)}
                className="mt-2 text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white"
              >
                Kapat
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
