"use client";

import React, { useState, useEffect } from "react";
import { Layout, ConfigProvider, theme as antdTheme } from "antd";
import { usePathname } from "next/navigation";
import UnifiedSidebar from "../components/dashboard/UnifiedSidebar";
import { AnimatePresence, motion } from "framer-motion";

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Force dark class for Unified OS experience
    document.documentElement.classList.add('dark');
  }, []);

  // Determine current module
  const isCms = pathname.startsWith("/dashboard/cms");
  const isHr = pathname.startsWith("/dashboard/hr");
  const isCrm = pathname.startsWith("/dashboard/crm");
  
  const currentModule = isHr ? "hr" : isCms ? "cms" : isCrm ? "crm" : "erp";

  const moduleConfigs = {
    erp: { color: "#2563eb", bg: "#020617" }, // Deep dark for all
    cms: { color: "#10b981", bg: "#020617" },
    hr: { color: "#9333ea", bg: "#020617" },
    crm: { color: "#dc2626", bg: "#020617" },
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
          colorBgContainer: "#0f172a", // Slate-900 (Card background)
          colorBgLayout: "#020617",    // Slate-950 (Main background)
          colorTextBase: "#f8fafc",    // Slate-50 (Text color)
        },
        algorithm: antdTheme.darkAlgorithm, // Force dark for all modules
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
        
        /* Global Dark Theme Refinement */
        .ant-layout { background: #020617 !important; }
        .ant-card { background: #0f172a !important; border-color: rgba(255,255,255,0.05) !important; }
        .ant-table { background: #0f172a !important; color: #cbd5e1 !important; }
        .ant-table-thead > tr > th { background: #1e293b !important; color: #fff !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        .ant-table-cell { border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
        .ant-typography { color: #f8fafc !important; }
        .ant-typography-secondary { color: #94a3b8 !important; }
        h1, h2, h3, h4, h5, h6 { color: #fff !important; }
        
        /* Force remove any white backgrounds that might linger */
        .bg-white { background-color: #0f172a !important; color: #f8fafc !important; }
        .text-slate-900 { color: #f8fafc !important; }
        .border-slate-200 { border-color: rgba(255,255,255,0.05) !important; }
        
        /* Specific Module Accents */
        .module-accent-text { color: ${config.color} !important; }
      `}</style>
    </ConfigProvider>
  );
}
