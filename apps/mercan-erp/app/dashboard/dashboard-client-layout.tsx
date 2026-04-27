"use client";

import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider, theme as antdTheme } from "antd";
import { usePathname } from "next/navigation";
import UnifiedSidebar from "../components/dashboard/UnifiedSidebar";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Determine current module
  const isCms = pathname.startsWith("/dashboard/cms");
  const isHr = pathname.startsWith("/dashboard/hr");
  const isCrm = pathname.startsWith("/dashboard/crm");
  
  const currentModule = isHr ? "hr" : isCms ? "cms" : isCrm ? "crm" : "erp";

  const moduleConfigs = {
    erp: { color: "#2563eb", bg: isDark ? "#020617" : "#f8fafc" },
    cms: { color: "#10b981", bg: isDark ? "#020617" : "#f8fafc" },
    hr: { color: "#9333ea", bg: isDark ? "#020617" : "#f8fafc" },
    crm: { color: "#dc2626", bg: isDark ? "#020617" : "#f8fafc" },
  };

  const config = moduleConfigs[currentModule];

  if (!mounted) return null;

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: config.color,
          borderRadius: 8,
          fontFamily: "inherit",
          colorBgContainer: isDark ? "#0f172a" : "#ffffff", 
          colorBgLayout: isDark ? "#020617" : "#f1f5f9",    
          colorTextBase: isDark ? "#f8fafc" : "#0f172a",    
        },
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        {/* UNIFIED SIDEBAR */}
        <UnifiedSidebar 
          module={currentModule} 
          collapsed={collapsed} 
          onCollapse={(val) => setCollapsed(val)} 
        />

        {/* MAIN CONTENT AREA */}
        <Layout 
          style={{ 
            marginLeft: collapsed ? 80 : 260, 
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            background: config.bg
          }}
        >
          <Content style={{ minHeight: "100vh" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </Content>
        </Layout>
      </Layout>

      <style jsx global>{`
        .hide-those-scrollbars::-webkit-scrollbar {
          display: none !important;
        }
        .hide-those-scrollbars {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
        
        /* Unified Theme Refinement */
        .ant-layout { background: ${isDark ? "#020617" : "#f8fafc"} !important; }
        .ant-card { 
          background: ${isDark ? "#0f172a" : "#ffffff"} !important; 
          border-color: ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important; 
          border-radius: 12px !important;
        }
        .ant-table { 
          background: ${isDark ? "#0f172a" : "#ffffff"} !important; 
          color: ${isDark ? "#cbd5e1" : "#1e293b"} !important; 
        }
        .ant-table-thead > tr > th { 
          background: ${isDark ? "#1e293b" : "#f1f5f9"} !important; 
          color: ${isDark ? "#fff" : "#0f172a"} !important; 
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important; 
        }
        .ant-table-cell { 
          border-bottom: 1px solid ${isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} !important; 
        }
        .ant-typography { color: ${isDark ? "#f8fafc" : "#0f172a"} !important; }
        .ant-typography-secondary { color: ${isDark ? "#94a3b8" : "#64748b"} !important; }
        h1, h2, h3, h4, h5, h6 { color: ${isDark ? "#fff" : "#0f172a"} !important; }
        
        /* Specific Module Accents */
        .module-accent-text { color: ${config.color} !important; }
        
        /* Fix for potential text contrast issues */
        .ant-btn-primary {
          box-shadow: 0 4px 12px ${config.color}40 !important;
        }
      `}</style>
    </ConfigProvider>
  );
}
