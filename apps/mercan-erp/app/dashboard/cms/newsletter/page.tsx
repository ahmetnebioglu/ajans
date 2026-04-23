import React from "react";
import { NewsletterClient } from "./NewsletterClient";
import { getAllSubscribers } from "../../../actions/newsletter-actions";
import { prisma as db } from "@ajans/db";

export default async function NewsletterPage() {
  const subscribersRes = await getAllSubscribers();
  const initialSubscribers = subscribersRes.success ? subscribersRes.subscribers : [];
  
  // Mevcut proje slug'larını çekelim (Filtreleme için)
  const projects = await db.newsletterSubscriber.findMany({
    select: { projectSlug: true },
    distinct: ['projectSlug'],
  });

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
          Merkezi Bülten <span className="text-blue-600">Yönetimi</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium italic">
          Tüm projelerden gelen aboneleri yönetin ve toplu bilgilendirme mailleri gönderin.
        </p>
      </div>

      <NewsletterClient 
        initialSubscribers={initialSubscribers} 
        projects={projects.map(p => p.projectSlug)}
      />
    </div>
  );
}
