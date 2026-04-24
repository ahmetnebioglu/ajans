import React from "react";
import { prisma as db } from "@/lib/db";
import { MessageSquare, FileText } from "lucide-react";
import RequestsClient from "./RequestsClient";

export default async function UnifiedRequestsPage() {
  const contactRequests = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  const referenceRequests = await db.referenceRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">Gelen Talepler</h1>
          <p className="text-slate-500 font-medium italic">Web sitesi üzerinden iletilen tüm mesaj ve referans istekleri.</p>
        </div>
      </div>

      {/* Client Component with Tabs */}
      <RequestsClient 
        contactRequests={contactRequests} 
        referenceRequests={referenceRequests} 
      />
    </div>
  );
}

