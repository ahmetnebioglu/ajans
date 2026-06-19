"use client";

import React, { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  CheckCircle2,
  X,
  Save,
  Users,
} from "lucide-react";
import { PERMISSION_MODULES } from "@ajans/auth/permissions";

interface RoleData {
  id: string;
  name: string;
  permissions: string[];
  isDefault: boolean;
  _count: { users: number };
}

export default function RolesSettingsPage() {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal durumları
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleData | null>(null);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await fetch("/api/settings/roles");
      const data = await res.json();
      if (res.ok) {
        setRoles(data.roles);
      }
    } catch {
      setError("Roller alınamadı.");
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setSelectedPermissions([]);
    setShowModal(true);
  };

  const openEditModal = (role: RoleData) => {
    setEditingRole(role);
    setRoleName(role.name);
    setSelectedPermissions([...role.permissions]);
    setShowModal(true);
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(key)
        ? prev.filter((p) => p !== key)
        : [...prev, key]
    );
  };

  const toggleModule = (modulePermissions: readonly { key: string }[]) => {
    const keys = modulePermissions.map((p) => p.key);
    const allSelected = keys.every((k) => selectedPermissions.includes(k));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !keys.includes(p)));
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...keys])]);
    }
  };

  const handleSaveRole = async () => {
    if (roleName.trim().length < 2) {
      setError("Rol adı en az 2 karakter olmalıdır.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const method = editingRole ? "PUT" : "POST";
      const body = editingRole
        ? { id: editingRole.id, name: roleName, permissions: selectedPermissions }
        : { name: roleName, permissions: selectedPermissions };

      const res = await fetch("/api/settings/roles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess(editingRole ? "Rol güncellendi." : "Rol oluşturuldu.");
      setShowModal(false);
      fetchRoles();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = async (role: RoleData) => {
    if (!confirm(`"${role.name}" rolünü silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/settings/roles?id=${role.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        return;
      }

      setSuccess("Rol silindi.");
      fetchRoles();
      setTimeout(() => setSuccess(null), 3000);
    } catch {
      setError("Silme işlemi başarısız.");
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
            ROL YÖNETİMİ
          </h2>
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
            DİNAMİK ROLLER VE İZİN ATAMALARI
          </p>
        </div>
        <button
          id="role-create-btn"
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20"
        >
          <Plus size={14} />
          YENİ ROL
        </button>
      </div>

      {/* Mesajlar */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl p-3">
          <p className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-wide">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">{success}</p>
        </div>
      )}

      {/* Rol Listesi */}
      <div className="space-y-3">
        {roles.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-12 text-center">
            <Shield size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-sm font-black text-slate-400 dark:text-slate-600 uppercase tracking-wide">
              Henüz rol tanımlanmamış
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-1">
              İlk rolünüzü oluşturmak için &quot;Yeni Rol&quot; butonuna tıklayın.
            </p>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-xl p-4 flex items-center gap-4 group hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-lg flex items-center justify-center">
                <Shield size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {role.name}
                  </h4>
                  {role.isDefault && (
                    <span className="text-[8px] font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      VARSAYILAN
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
                    <Users size={10} /> {role._count.users} kullanıcı
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {role.permissions.length} izin
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEditModal(role)}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDeleteRole(role)}
                  className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition-colors"
                  disabled={role.isDefault}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rol Oluşturma/Düzenleme Modalı */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            {/* Modal Başlık */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tighter uppercase">
                  {editingRole ? "ROL DÜZENLE" : "YENİ ROL"}
                </h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.3em] mt-1">
                  İZİNLERİ SEÇİN
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Rol Adı */}
            <div className="mb-6">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">
                Rol Adı *
              </label>
              <input
                id="role-name"
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder='Örn: "İK Yöneticisi", "Sadece Okur"'
                className="w-full px-4 py-3 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all dark:text-white"
                required
                minLength={2}
              />
            </div>

            {/* İzin Matrisi */}
            <div className="space-y-4">
              {PERMISSION_MODULES.map((module) => {
                const moduleKeys = module.permissions.map((p) => p.key);
                const allSelected = moduleKeys.every((k) =>
                  selectedPermissions.includes(k)
                );
                const someSelected =
                  !allSelected &&
                  moduleKeys.some((k) => selectedPermissions.includes(k));

                return (
                  <div
                    key={module.module}
                    className="border border-slate-200/50 dark:border-zinc-800 rounded-xl overflow-hidden"
                  >
                    {/* Modül Başlığı */}
                    <div
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-zinc-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => toggleModule(module.permissions)}
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                          allSelected
                            ? "bg-blue-600 border-blue-600"
                            : someSelected
                            ? "bg-blue-300 border-blue-300"
                            : "border-slate-300 dark:border-zinc-600"
                        }`}
                      >
                        {(allSelected || someSelected) && (
                          <svg
                            width="10"
                            height="8"
                            viewBox="0 0 10 8"
                            className="text-white"
                          >
                            <path
                              d="M1 4L3.5 6.5L9 1"
                              stroke="currentColor"
                              strokeWidth="2"
                              fill="none"
                            />
                          </svg>
                        )}
                      </div>
                      <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        {module.label}
                      </span>
                    </div>

                    {/* İzinler */}
                    <div className="p-3 space-y-2">
                      {module.permissions.map((perm) => {
                        const isSelected = selectedPermissions.includes(
                          perm.key
                        );
                        return (
                          <label
                            key={perm.key}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
                          >
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-blue-600 border-blue-600"
                                  : "border-slate-300 dark:border-zinc-600"
                              }`}
                            >
                              {isSelected && (
                                <svg
                                  width="8"
                                  height="6"
                                  viewBox="0 0 10 8"
                                  className="text-white"
                                >
                                  <path
                                    d="M1 4L3.5 6.5L9 1"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    fill="none"
                                  />
                                </svg>
                              )}
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                                {perm.label}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 dark:text-slate-600 ml-2 font-mono">
                                {perm.key}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Kaydet Butonu */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-zinc-800">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-700 transition-colors"
              >
                İPTAL
              </button>
              <button
                id="role-save-btn"
                onClick={handleSaveRole}
                disabled={saving || roleName.trim().length < 2}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                {saving ? "KAYDEDİLİYOR..." : "KAYDET"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
