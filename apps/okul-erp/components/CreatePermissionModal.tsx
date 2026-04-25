"use client";

import React, { useState, useTransition } from "react";
import { Dialog, Button, Input } from "@ajans/ui";
import { PlusCircle, Send } from "lucide-react";
import { createPermissionRequest } from "../lib/actions/permission-actions";
import { toast } from "sonner";

interface CreatePermissionModalProps {
  students: any[];
}

export function CreatePermissionModal({ students }: CreatePermissionModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const formData = new FormData(e.currentTarget);
    const data = {
      studentId: formData.get("studentId") as string,
      type: formData.get("type") as string,
      date: new Date(formData.get("date") as string),
      reason: formData.get("reason") as string,
    };

    startTransition(async () => {
      try {
        const result = await createPermissionRequest(data);
        if (result.success) {
          toast.success("İzin talebi başarıyla gönderildi.");
          setIsOpen(false);
        } else {
          toast.error("Talep oluşturulamadı.");
        }
      } catch (error) {
        toast.error("Bir hata oluştu.");
        console.error(error);
      }
    });
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-500 hover:bg-indigo-600 rounded-2xl py-6 px-8 shadow-xl shadow-indigo-500/20 text-xs font-bold transition-all hover:-translate-y-1"
      >
        <PlusCircle className="mr-2" size={18} /> Yeni İzin Talebi
      </Button>

      <Dialog 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title="Yeni İzin Talebi"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Öğrenci Seçimi</label>
            <select 
              name="studentId"
              required
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
            >
              <option value="">Öğrenci Seçin...</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">İzin Türü</label>
              <select 
                name="type"
                required
                className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-semibold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none"
              >
                <option value="Hastalık">Hastalık</option>
                <option value="Ailevi">Ailevi</option>
                <option value="Diğer">Diğer</option>
              </select>
            </div>
            <Input 
              label="İzin Tarihi" 
              name="date"
              type="date" 
              required
              className="rounded-2xl"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Gerekçe</label>
            <textarea 
              name="reason"
              required
              placeholder="İzin gerekçesini kısaca açıklayın..."
              className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[2rem] text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all min-h-[120px] resize-none"
            />
          </div>

          <div className="pt-4 flex gap-4">
             <Button 
               type="button" 
               variant="outline" 
               className="flex-1 py-5 rounded-2xl"
               onClick={() => setIsOpen(false)}
             >
                Vazgeç
             </Button>
             <Button 
               type="submit" 
               className="flex-[2] py-5 rounded-2xl bg-indigo-500 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20"
               disabled={isPending}
             >
                {isPending ? "Gönderiliyor..." : <><Send size={16} className="mr-2" /> Talebi Gönder</>}
             </Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}
