"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Check,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
  isDark?: boolean;
}

export default function WorkspaceSwitcher({
  collapsed,
  isDark,
}: WorkspaceSwitcherProps) {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);

  const availableWorkspaces =
    (session?.user as any)?.availableWorkspaces || [];
  const currentWorkspaceId =
    (session?.user as any)?.currentWorkspaceId || null;

  // Tekli workspace ise gösterme
  if (availableWorkspaces.length <= 1) {
    if (availableWorkspaces.length === 1) {
      return (
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
            isDark ? "bg-zinc-900" : "bg-slate-50"
          } ${collapsed ? "justify-center" : ""}`}
        >
          <Building2
            size={14}
            className={`${
              isDark ? "text-blue-400" : "text-blue-600"
            } shrink-0`}
          />
          {!collapsed && (
            <span
              className={`text-[9px] font-black uppercase tracking-wide truncate ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              {availableWorkspaces[0].name}
            </span>
          )}
        </div>
      );
    }
    return null;
  }

  const currentWorkspace = availableWorkspaces.find(
    (ws: any) => ws.id === currentWorkspaceId
  );

  const handleSwitch = async (workspaceId: string) => {
    if (workspaceId === currentWorkspaceId || switching) return;

    setSwitching(workspaceId);

    try {
      const res = await fetch("/api/workspace/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId }),
      });
      const data = await res.json();

      if (!res.ok) {
        console.error("Switch error:", data.error);
        return;
      }

      // Session'ı güncelle
      await updateSession({
        currentWorkspaceId: data.currentWorkspaceId,
        permissions: data.permissions,
      });

      setOpen(false);

      // Sayfayı yenile (yeni tenant context için)
      router.refresh();
    } catch (err) {
      console.error("Switch error:", err);
    } finally {
      setSwitching(null);
    }
  };

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        id="workspace-switcher"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg w-full transition-all duration-200 ${
          isDark
            ? "bg-zinc-900 hover:bg-zinc-800 border border-zinc-800"
            : "bg-slate-50 hover:bg-slate-100 border border-slate-200"
        } ${collapsed ? "justify-center" : ""}`}
      >
        <ArrowRightLeft
          size={14}
          className={`shrink-0 ${
            isDark ? "text-blue-400" : "text-blue-600"
          }`}
        />
        {!collapsed && (
          <>
            <span
              className={`text-[9px] font-black uppercase tracking-wide truncate flex-1 text-left ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              {currentWorkspace?.name || "Workspace"}
            </span>
            <ChevronDown
              size={12}
              className={`shrink-0 transition-transform duration-200 ${
                open ? "rotate-180" : ""
              } ${isDark ? "text-slate-500" : "text-slate-400"}`}
            />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            className={`absolute z-50 w-64 rounded-xl shadow-2xl border animate-in fade-in zoom-in-95 duration-200 ${
              collapsed ? "left-full ml-2 bottom-0" : "bottom-full mb-2 left-0"
            } ${
              isDark
                ? "bg-zinc-900 border-zinc-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="p-2">
              <div
                className={`px-3 py-2 text-[8px] font-black uppercase tracking-[0.3em] ${
                  isDark ? "text-slate-500" : "text-slate-400"
                }`}
              >
                ÇALIŞMA ALANLARI
              </div>

              {availableWorkspaces.map((ws: any) => {
                const isActive = ws.id === currentWorkspaceId;
                const isSwitching = switching === ws.id;

                return (
                  <button
                    key={ws.id}
                    onClick={() => handleSwitch(ws.id)}
                    disabled={isActive || !!switching}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? isDark
                          ? "bg-blue-950/30 border border-blue-800/30"
                          : "bg-blue-50 border border-blue-200/50"
                        : isDark
                        ? "hover:bg-zinc-800"
                        : "hover:bg-slate-50"
                    } ${switching && !isSwitching ? "opacity-50" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[10px] shrink-0 ${
                        isActive
                          ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                          : isDark
                          ? "bg-zinc-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {ws.name
                        .split(" ")
                        .map((w: string) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div
                        className={`text-[10px] font-black uppercase tracking-wide truncate ${
                          isActive
                            ? isDark
                              ? "text-blue-300"
                              : "text-blue-700"
                            : isDark
                            ? "text-slate-300"
                            : "text-slate-700"
                        }`}
                      >
                        {ws.name}
                      </div>
                    </div>
                    {isSwitching ? (
                      <Loader2
                        size={14}
                        className="animate-spin text-blue-500 shrink-0"
                      />
                    ) : isActive ? (
                      <Check size={14} className="text-blue-500 shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
