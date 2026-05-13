"use client";

import React, { useEffect, useState } from "react";
import { ConfigProvider, theme as antdTheme, App } from "antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import trTR from "antd/locale/tr_TR";

import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "../context/AuthContext";
import { SyncProvider } from "../src/context/SyncContext";
import FloatingSyncWidget from "../components/sync/FloatingSyncWidget";

function AntdConfig({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div style={{ visibility: "hidden" }}>{children}</div>;
  }

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <ConfigProvider
      locale={trTR}
      theme={{
        token: {
          colorPrimary: isDark ? "hsl(0 84% 60%)" : "hsl(358 87% 52%)",
          borderRadius: 4, // "İmza" border radius
          fontSize: 14,
          fontFamily: "inherit",
          colorBgContainer: isDark ? "#0f172a" : "#ffffff", 
          colorBgLayout: isDark ? "#020617" : "#f1f5f9",    
          colorTextBase: isDark ? "#f8fafc" : "#1e293b",    
        },
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        components: {
          Card: {
            borderRadiusLG: 4,
            boxShadowTertiary: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
          },
          Button: {
            borderRadius: 4,
            borderRadiusSM: 4,
            controlHeight: 38,
          },
          Table: {
            headerBg: isDark ? "#1e293b" : "#f8fafc",
            headerColor: isDark ? "#fff" : "#0f172a",
            headerBorderRadius: 4,
          }
        }
      }}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthProvider>
        <SyncProvider>
          <AntdRegistry>
            <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
              <AntdConfig>
                {children}
                <FloatingSyncWidget />
              </AntdConfig>
            </NextThemesProvider>
          </AntdRegistry>
        </SyncProvider>
      </AuthProvider>
    </SessionProvider>
  );
}
