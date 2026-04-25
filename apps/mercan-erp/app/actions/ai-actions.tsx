"use server";

import { streamUI } from "@ai-sdk/rsc";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { BarChart, AreaChart } from "@ajans/ui";
import { protectedAction } from "@ajans/core/server";

export async function chatWithAi(prompt: string) {
  return protectedAction(async ({ db, user }) => {
    // OpenAI API Key kontrolü
    if (!process.env.OPENAI_API_KEY) {
      return {
        error: "OPENAI_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.",
      };
    }

    const result = await streamUI({
      model: openai("gpt-4o"),
      prompt: prompt,
      text: ({ content }) => <p className="text-sm italic">{content}</p>,
      tools: {
        compareLeadSources: {
          description: "CRM lead kaynaklarını karşılaştırmak için grafik oluşturur.",
          parameters: z.object({
            title: z.string(),
            data: z.array(z.object({
              name: z.string(),
              value: z.number()
            }))
          }),
          generate: async ({ title, data }) => {
            return (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</h4>
                <BarChart 
                  data={data}
                  index="name"
                  categories={["value"]}
                  colors={["#0d9488"]}
                  className="h-48"
                />
              </div>
            );
          }
        },
        showReportTrend: {
          description: "Rapor trendlerini görselleştirir.",
          parameters: z.object({
            title: z.string(),
            data: z.array(z.object({
              month: z.string(),
              count: z.number()
            }))
          }),
          generate: async ({ title, data }) => {
            return (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-500">{title}</h4>
                <AreaChart 
                  data={data}
                  index="month"
                  categories={["count"]}
                  colors={["#4f46e5"]}
                  className="h-48"
                />
              </div>
            );
          }
        }
      }
    });

    return result.value;
  });
}
