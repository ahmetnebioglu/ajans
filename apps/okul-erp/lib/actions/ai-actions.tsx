"use server";

import { streamUI } from "@ai-sdk/rsc";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { BarChart, AreaChart } from "@ajans/ui";
import { protectedAction } from "@ajans/core/server";

export async function chatWithAi(prompt: string) {
  return protectedAction(async ({ db, user }) => {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY bulunamadı. Lütfen .env dosyasını kontrol edin.");
    }

    const result = await streamUI({
      model: openai("gpt-4o"),
      prompt: prompt,
      text: ({ content }) => <p className="text-sm font-medium italic">{content}</p>,
      tools: {
        analyzePermissions: {
          description: "İzin taleplerini kategorize edip analiz eder.",
          inputSchema: z.object({
            title: z.string(),
            data: z.array(z.object({
              category: z.string(),
              count: z.number()
            }))
          }),
          generate: async ({ title, data }) => {
            return (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">{title}</h4>
                <BarChart 
                  data={data}
                  index="category"
                  categories={["count"]}
                  colors={["#6366f1"]}
                  className="h-40"
                />
              </div>
            );
          }
        },
        studentTrend: {
          description: "Öğrenci devamsızlık veya izin trendlerini gösterir.",
          inputSchema: z.object({
            title: z.string(),
            data: z.array(z.object({
              day: z.string(),
              count: z.number()
            }))
          }),
          generate: async ({ title, data }) => {
            return (
              <div className="space-y-4 animate-in fade-in zoom-in duration-500 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">{title}</h4>
                <AreaChart 
                  data={data}
                  index="day"
                  categories={["count"]}
                  colors={["#f59e0b"]}
                  className="h-40"
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
