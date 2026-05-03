"use client";

import React, { useState, useEffect } from "react";
import { Layout } from "antd";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import Sidebar from "./Sidebar";

const { Content } = Layout;

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isDark = theme === "dark" || (theme === "system" && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  const isAuthPage = pathname === "/login";

  return (
    <Layout style={{ minHeight: "100vh", background: isDark ? "#020617" : "#f6f6f6" }}>
      {!isAuthPage && (
        <Sidebar collapsed={collapsed} onCollapse={(val) => setCollapsed(val)} />
      )}

      <Layout 
        style={{ 
          marginLeft: isAuthPage ? 0 : (collapsed ? 80 : 260), 
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          background: isDark ? "#020617" : "#f6f6f6",
          minHeight: "100vh"
        }}
      >
        <Content className="min-h-screen overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </Content>
      </Layout>

      <style jsx global>{`
        .hide-those-scrollbars::-webkit-scrollbar { display: none !important; }
        .hide-those-scrollbars { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        
        /* Enforce high contrast text in AntD components for Dark Mode */
        .dark .ant-typography, .dark .ant-list-item-meta-title { color: #f8fafc !important; }
        .dark .ant-list-item-meta-description { color: #94a3b8 !important; }
      `}</style>
    </Layout>
  );
}
