'use server'

import { unsecured_prisma as prisma } from "@ajans/db";

export async function getApiUsageStats() {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usages = await prisma.apiUsage.findMany({
      where: {
        createdAt: {
          gte: startOfMonth
        }
      }
    });

    const totalCost = usages.reduce((sum, item) => sum + item.cost, 0);
    
    // Servis bazlı gruplama
    const serviceStats = usages.reduce((acc, item) => {
      if (!acc[item.service]) {
        acc[item.service] = { count: 0, cost: 0 };
      }
      acc[item.service].count += 1;
      acc[item.service].cost += item.cost;
      return acc;
    }, {} as Record<string, { count: number, cost: number }>);

    const chartData = Object.entries(serviceStats).map(([service, data]) => ({
      service,
      cost: Number(data.cost.toFixed(4)),
      count: data.count
    }));

    return {
      success: true,
      totalCost,
      stats: serviceStats,
      chartData,
      count: usages.length
    };
  } catch (error: any) {
    console.error("Failed to fetch API usage stats:", error);
    return { success: false, error: error.message };
  }
}
