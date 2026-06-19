"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Mail,
  UserPlus,
  Shield,
} from "lucide-react";

interface WorkspaceUserData {
  id: string;
  userId: string;
  roleId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
    role: string;
  };
  role: {
    id: string;
    name: string;
  } | null;
}

interface RoleData {
  id: string;
  name: string;
}

export default function UsersSettingsPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<WorkspaceUserData[]>([]);
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Davet modalı
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRoleId, setInviteRoleId] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetch("/api/settings/users"),
        fetch("/api/settings/roles"),
      ]);
      const usersData = await usersRes.json();
      const rolesData = await rolesRes.json();

      if (usersRes.ok) setUsers(usersData.users);
      if (rolesRes.ok) setRoles(rolesData.roles);
    } catch {
      setError("Veri alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInviting(true);

    try {
      const res = await fetch("/api/settings/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          roleId: inviteRoleId || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setInviting(false);
        return;
      }

      setSuccess("Kullanıcı başarıyla eklendi.");
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRoleId("");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Bağlantı hatası.");
    } finally {
      setInviting(false);
    }
  };

  const handleChangeRole = async (
    workspaceUserId: string,
    newRoleId: string
  ) => {
    try {
      const res = await fetch("/api/settings/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workspaceUserId,
          roleId: newRoleId || null,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Rol güncellendi.");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Güncelleme başarısız.");
    }
  };

  const handleRemoveUser = async (wu: WorkspaceUserData) => {
    if (
      !confirm(
        `"${wu.user.name || wu.user.email}" kullanıcısını çalışma alanından çıkarmak istediğinize emin misiniz?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/users?id=${wu.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Kullanıcı çıkarıldı.");
      fetchData();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("İşlem başarısız.");
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
            KULLANICI YÖNETİMİ
          </h2>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
            DAVET ET, ROL ATA VE YÖNETİ
          </p>
        </div>
        <button
          id="user-invite-btn"
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
        >
          <UserPlus size={14} />
          DAVET ET
        </button>
      </div>

      {/* Mesajlar */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">
            {error}
          </p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
            {success}
          </p>
        </div>
      )}

      {/* Kullanıcı Listesi */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users
              size={40}
              className="mx-auto text-slate-300 dark:text-slate-700 mb-4"
            />
            <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-wide">
              Henüz kullanıcı yok
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800">
            {users.map((wu) => {
              const isCurrentUser = wu.userId === session?.user?.id;
              return (
                <div
                  key={wu.id}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors group"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-black text-xs uppercase shrink-0">
                    {wu.user.name
                      ? wu.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                      : "?"}
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                        {wu.user.name || "İsimsiz"}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          SİZ
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">
                      {wu.user.email}
                    </div>
                  </div>

                  {/* Rol Seçici */}
                  <div className="flex items-center gap-2">
                    <select
                      value={wu.roleId || ""}
                      onChange={(e) => handleChangeRole(wu.id, e.target.value)}
                      disabled={isCurrentUser}
                      className="px-3 py-2 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-lg text-[10px] font-black uppercase tracking-wide text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-blue-500 transition-all disabled:opacity-50"
                    >
                      <option value="">Rol Atanmadı</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>

                    {/* Çıkar butonu */}
                    {!isCurrentUser && (
                      <button
                        onClick={() => handleRemoveUser(wu)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors opacity-0 group-hover:opacity-100"
                        title="Kullanıcıyı çıkar"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Davet Modalı */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Başlık */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  KULLANICI DAVET ET
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
                  MEVCUT HESABI OLAN KULLANICI EKLEYİN
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              {/* E-posta */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  E-posta Adresi *
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="kullanici@sirket.com"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                    required
                  />
                </div>
              </div>

              {/* Rol Seçimi */}
              <div>
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                  Rol (Opsiyonel)
                </label>
                <div className="relative">
                  <Shield
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <select
                    id="invite-role"
                    value={inviteRoleId}
                    onChange={(e) => setInviteRoleId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white appearance-none"
                  >
                    <option value="">Rol atanmasın</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Butonlar */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                  İPTAL
                </button>
                <button
                  id="invite-submit"
                  type="submit"
                  disabled={inviting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
                >
                  {inviting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <UserPlus size={14} />
                  )}
                  {inviting ? "EKLENİYOR..." : "DAVET ET"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
