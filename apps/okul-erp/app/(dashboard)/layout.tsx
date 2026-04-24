import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b h-16 flex items-center px-8 bg-card">
        <h1 className="font-bold">Yönetim Paneli</h1>
      </header>
      <main className="p-8">
        {children}
      </main>
    </div>
  );
}
