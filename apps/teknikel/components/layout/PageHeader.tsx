'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children?: React.ReactNode; // Sağ taraftaki aksiyonlar/kontroller
}

export default function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    const layoutHeader = document.getElementById('main-layout-header');
    const portalTarget = document.getElementById('layout-header-portal');
    
    if (layoutHeader && portalTarget) {
      layoutHeader.style.display = 'flex';
      setPortalNode(portalTarget);
    }

    return () => {
      // Bir sayfadan diğerine geçerken header kaybolmasın diye sadece mount/unmount sırasında display kontrolü
      if (layoutHeader) {
        layoutHeader.style.display = 'none';
      }
    };
  }, []);

  if (!mounted || !portalNode) return null;

  return createPortal(
    <div className="flex items-center justify-between w-full gap-4">
      <div className="flex flex-col justify-center">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 m-0 leading-tight">
          {title}
        </h1>
        {subtitle && (
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </div>
        )}
      </div>
      
      {children && (
        <div className="flex items-center gap-3">
          {children}
        </div>
      )}
    </div>,
    portalNode
  );
}
