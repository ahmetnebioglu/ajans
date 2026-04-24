"use server";

import { createOpenAI } from "@ai-sdk/openai";
import { streamUI } from "@ai-sdk/rsc";
import { z } from "zod";
import { getLeads } from "@ajans/core";
import { BarChart, PieChart, AreaChart } from "@ajans/ui";
import { getServerSession } from "next-auth";
import { authOptions } from "@ajans/auth/options";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function streamCrmInsights(userInput: string) {
  const session = await getServerSession(authOptions);
  const tenantId = (session?.user as any)?.tenantId || "mercan";

  const result = await streamUI({
    model: openai("gpt-4o"),
    prompt: userInput,
    text: ({ content }) => <div className="text-sm text-zinc-400 italic p-4">{content}</div>,
    tools: {
      getLeadsBySource: {
        description: "En çok lead gelen kaynakları analiz eder ve grafik olarak gösterir.",
        parameters: z.object({}),
        generate: async function* () {
          yield <div className="p-4 text-[10px] font-black uppercase text-zinc-500 animate-pulse">Veriler analiz ediliyor...</div>;
          
          const leadsRes = await getLeads(tenantId);
          const leads = leadsRes.success ? leadsRes.data : [];
          
          const sourceMap: Record<string, number> = {};
          leads.forEach((l: any) => {
            sourceMap[l.source] = (sourceMap[l.source] || 0) + 1;
          });

          const data = Object.entries(sourceMap).map(([name, count]) => ({ name, count }));

          return (
            <div className="bg-black border border-zinc-800 p-6 rounded-none space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 italic">Kaynak Analizi (Leads)</h3>
              <BarChart 
                data={data} 
                index="name" 
                categories={["count"]} 
                colors={["#0d9488"]} 
              />
            </div>
          );
        },
      },
      getLeadsByStatus: {
        description: "Leadlerin durum dağılımını (New, Contacted vb.) gösterir.",
        parameters: z.object({}),
        generate: async function* () {
          yield <div className="p-4 text-[10px] font-black uppercase text-zinc-500 animate-pulse">Durumlar hesaplanıyor...</div>;
          
          const leadsRes = await getLeads(tenantId);
          const leads = leadsRes.success ? leadsRes.data : [];
          
          const statusMap: Record<string, number> = {};
          leads.forEach((l: any) => {
            statusMap[l.status] = (statusMap[l.status] || 0) + 1;
          });

          const data = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

          return (
            <div className="bg-black border border-zinc-800 p-6 rounded-none space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500 italic">Durum Dağılımı</h3>
              <PieChart 
                data={data} 
                index="name" 
                category="value" 
              />
            </div>
          );
        },
      },
    },
  });

  return result.value;
}
