"use client";

import React, { useEffect, useState } from "react";
import { Result, Button, ConfigProvider, theme } from "antd";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { useTheme } from "next-themes";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = currentTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: "#f43f5e",
          borderRadius: 4,
        },
      }}
    >
      <div className={`min-h-screen flex items-center justify-center p-4 font-medium italic transition-colors duration-500 ${isDark ? 'bg-zinc-950' : 'bg-slate-50'}`}>
        <div className={`max-w-xl w-full p-8 rounded-[4px] shadow-2xl animate-in fade-in zoom-in duration-500 border ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-slate-200'}`}>
          <Result
            icon={<ShieldAlert size={64} className="text-rose-500 mx-auto mb-4 animate-bounce" />}
            status="error"
            title={<span className={`text-2xl font-black uppercase tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>Erişim Yetkiniz Yok</span>}
            subTitle={
              <span className={`${isDark ? 'text-zinc-400' : 'text-slate-500'} font-bold uppercase tracking-widest text-[10px] leading-relaxed block mt-2`}>
                Bu modüle erişmek için gerekli yetkilere sahip değilsiniz. <br />
                Lütfen sistem yöneticinizle iletişime geçin.
              </span>
            }
            extra={[
              <Button 
                key="login" 
                type="primary" 
                size="large"
                className="bg-rose-600 hover:bg-rose-500 border-none h-auto py-3 px-8 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-rose-600/20 active:scale-95 transition-all"
                onClick={() => router.push("/login")}
              >
                Giriş Sayfasına Dön
              </Button>,
              <Button 
                key="back" 
                type="link"
                className={`${isDark ? 'text-zinc-500 hover:text-white' : 'text-slate-400 hover:text-slate-600'} text-[9px] font-bold uppercase tracking-widest mt-4`}
                onClick={() => router.back()}
              >
                Geri Dön
              </Button>
            ]}
          />
        </div>
      </div>
    </ConfigProvider>
  );
}
