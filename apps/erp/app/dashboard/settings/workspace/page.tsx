"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Building2,
  Save,
  Loader2,
  CheckCircle2,
  Zap,
  Globe,
  Users,
  MessageSquare,
} from "lucide-react";

interface WorkspaceData {
  id: string;
  name: string;
  tenantId: string;
  address: string | null;
  taxNumber: string | null;
  taxOffice: string | null;
  phone: string | null;
  activeModules: string[];
  _count: {
    users: number;
    roles: number;
  };
}

const moduleInfo = [
  { key: "DRIVE", name: "Drive", icon: <Zap size={16} />, color: "text-blue-500", bgColor: "bg-blue-50 dark:bg-blue-950/30" },
  { key: "CMS", name: "CMS", icon: <Globe size={16} />, color: "text-emerald-500", bgColor: "bg-emerald-50 dark:bg-emerald-950/30" },
  { key: "HR", name: "HR", icon: <Users size={16} />, color: "text-purple-500", bgColor: "bg-purple-50 dark:bg-purple-950/30" },
  { key: "CRM", name: "CRM", icon: <MessageSquare size={16} />, color: "text-red-500", bgColor: "bg-red-50 dark:bg-red-950/30" },
];

export default function WorkspaceSettingsPage() {
  const { data: session } = useSession();
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form alanları
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [taxNumber, setTaxNumber] = useState("");
  const [taxOffice, setTaxOffice] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = async () => {
    try {
      const res = await fetch("/api/settings/workspace");
      const data = await res.json();
      if (res.ok && data.workspace) {
        setWorkspace(data.workspace);
        setName(data.workspace.name || "");
        setAddress(data.workspace.address || "");
        setTaxNumber(data.workspace.taxNumber || "");
        setTaxOffice(data.workspace.taxOffice || "");
        setPhone(data.workspace.phone || "");
      }
    } catch {
      setError("Veri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch("/api/settings/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, taxNumber, taxOffice, phone }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Güncelleme başarısız.");
        return;
      }

      setWorkspace(data.workspace);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
          ÇALIŞMA ALANI
        </h2>
        <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
          GENEL BİLGİLER VE YAPILANDIRMA
        </p>
      </div>

      {/* İstatistikler */}
      {workspace && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl p-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">TENANT ID</div>
            <div className="text-sm font-black text-slate-900 dark:text-white mt-1 font-mono truncate">{workspace.tenantId}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl p-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">KULLANICILAR</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workspace._count.users}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl p-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ROLLER</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workspace._count.roles}</div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl p-4">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">MODÜLLER</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{workspace.activeModules.length}</div>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
            <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex items-center gap-2">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Başarıyla kaydedildi.</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Çalışma Alanı Adı *</label>
              <input
                id="ws-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                required
                minLength={2}
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Telefon</label>
              <input
                id="ws-phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Adres</label>
              <input
                id="ws-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Vergi Numarası</label>
              <input
                id="ws-tax-number"
                type="text"
                value={taxNumber}
                onChange={(e) => setTaxNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Vergi Dairesi</label>
              <input
                id="ws-tax-office"
                type="text"
                value={taxOffice}
                onChange={(e) => setTaxOffice(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              id="ws-save"
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
            </button>
          </div>
        </form>
      </div>

      {/* Aktif Modüller */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4">
          AKTİF MODÜLLER
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moduleInfo.map((mod) => {
            const isActive = workspace?.activeModules.includes(mod.key);
            return (
              <div
                key={mod.key}
                className={`p-4 rounded-xl border transition-all ${
                  isActive
                    ? `${mod.bgColor} border-slate-200/50 dark:border-zinc-700`
                    : "bg-slate-50 dark:bg-zinc-800/50 border-slate-200/30 dark:border-zinc-800 opacity-50"
                }`}
              >
                <div className={`${mod.color} mb-2`}>{mod.icon}</div>
                <div className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  {mod.name}
                </div>
                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                  {isActive ? "AKTİF" : "PASİF"}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
