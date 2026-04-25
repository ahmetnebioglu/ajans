"use client";

import React, { useState, useTransition } from "react";
import { KanbanBoard, KanbanColumn, LeadCard } from "@ajans/crm";
import { updateLeadStatus } from "@ajans/core";
import { DragEndEvent } from "@dnd-kit/core";
import { Mail, Phone, Calendar, User, Tag, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface LeadItem {
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
  { id: "NEW", title: "Yeni" },
  { id: "CONTACTED", title: "Temas" },
  { id: "PROPOSAL_SENT", title: "Teklif" },
  { id: "CLOSED_WON", title: "Başarı" },
  { id: "CLOSED_LOST", title: "Kaybedildi" },
];

export default function CrmKanbanClient({ initialLeads, tenantId, userId }: { initialLeads: LeadItem[], tenantId: string, userId: string }) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [isPending, startTransition] = useTransition();

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;
    const lead = leads.find(l => l.id === leadId);

    if (lead && lead.status !== newStatus) {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

      startTransition(async () => {
        const res = await updateLeadStatus(leadId, newStatus, tenantId, userId);
        if (res.success) {
          toast.success("Durum güncellendi");
        } else {
          toast.error("Güncelleme başarısız!");
          setLeads(initialLeads);
        }
      });
    }
  };

  return (
    <KanbanBoard 
      onDragEnd={onDragEnd}
      className="flex flex-col xl:flex-row gap-4 min-h-0 h-full overflow-x-auto scrollbar-hide pb-2 bg-zinc-950"
    >
      {COLUMNS.map((col) => (
        <KanbanColumn 
          key={col.id} 
          id={col.id}
          className="flex-1 min-w-[300px] max-w-[380px] h-full bg-zinc-900 border border-zinc-800 rounded-[4px] flex flex-col shadow-lg relative overflow-hidden"
        >
          {/* Column Header - STICKY & SHARP */}
          <div className="sticky top-0 z-20 flex items-center justify-between border-b border-zinc-800 p-2.5 bg-zinc-900/95 backdrop-blur-sm shrink-0">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-[4px] animate-pulse" />
              {col.title}
            </h3>
            <span className="text-[9px] font-mono text-zinc-600 bg-black px-2 py-0.5 border border-zinc-800 rounded-[4px]">
              {leads.filter(l => l.status === col.id).length}
            </span>
          </div>

          {/* Cards Area */}
          <div className="flex-1 p-2 space-y-1.5 overflow-y-auto min-h-0 scrollbar-hide">
            {leads.filter(l => l.status === col.id).map((lead) => (
              <LeadCard 
                key={lead.id} 
                id={lead.id} 
                item={lead}
                className="bg-black border border-zinc-800 rounded-[4px] p-2.5 relative group cursor-grab active:cursor-grabbing hover:border-teal-500/50 transition-all shadow-md shrink-0"
                activeClassName="opacity-0"
              >
                {/* Neon Accent Line - SHARP */}
                <div className="absolute top-2.5 left-0 w-0.5 h-4 bg-zinc-800 group-hover:bg-teal-500 transition-colors" />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[7px] font-black uppercase tracking-widest text-teal-500 bg-teal-500/5 px-1.5 py-0.5 border border-teal-500/20 rounded-[4px]">
                      {lead.source}
                    </span>
                    <span className="text-[7px] font-mono text-zinc-600">
                      #{lead.id.slice(-4)}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[11px] font-black text-zinc-200 uppercase tracking-tighter italic flex items-center gap-1.5 leading-none">
                      <User size={10} className="text-zinc-600" />
                      {lead.fullName}
                    </h4>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Mail size={8} />
                        <span className="text-[8px] font-bold truncate">{lead.email}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-zinc-500">
                          <Phone size={8} />
                          <span className="text-[8px] font-bold">{lead.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-1.5 bg-zinc-950 border border-zinc-800/50 rounded-[4px]">
                    <p className="text-[8px] text-zinc-400 italic leading-tight line-clamp-1">
                      {lead.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1 text-zinc-600">
                      <Calendar size={9} />
                      <span className="text-[7px] font-bold uppercase">{new Date(lead.createdAt).toLocaleDateString('tr-TR')}</span>
                    </div>
                    <ArrowRight size={10} className="text-zinc-800 group-hover:text-teal-500 transition-colors" />
                  </div>
                </div>
              </LeadCard>
            ))}
          </div>
        </KanbanColumn>
      ))}
    </KanbanBoard>
  );
}
