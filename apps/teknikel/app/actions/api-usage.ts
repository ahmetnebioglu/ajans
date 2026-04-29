'use server'

import { unsecured_prisma as prisma } from "@ajans/db";
import { getBalance, getSenders } from "@ajans/core";

export async function getApiUsageStats() {
  try {
    const [netgsmBalance, apiSenders] = await Promise.all([
      getBalance(),
      getSenders()
    ]);
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

    const lastCall = await prisma.apiUsage.findFirst({
      orderBy: { createdAt: 'desc' }
    });

    const lastSmsCall = await prisma.apiUsage.findFirst({
      where: { service: 'NETGSM' },
      orderBy: { createdAt: 'desc' }
    });

    // Next.js dev server restart edilmediyse prisma.netgsmConfig undefined olabilir
    let netgsmConfig = null;
    if (prisma.netgsmConfig) {
      netgsmConfig = await prisma.netgsmConfig.findUnique({
        where: { tenantId: 'teknikel' }
      });
    }

    let remainingDays = null;
    if (netgsmConfig?.packageEndDate) {
      const now = new Date();
      const end = new Date(netgsmConfig.packageEndDate);
      const diffTime = end.getTime() - now.getTime();
      remainingDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
    }

    return {
      success: true,
      totalCost,
      stats: serviceStats,
      chartData,
      count: usages.length,
      lastCallAt: lastCall?.createdAt || null,
      netgsmBalance: netgsmBalance?.amount || 0,
      netgsmExpiry: netgsmBalance?.expiryDate || null,
      netgsmDetails: {
        packageStartDate: netgsmConfig?.packageStartDate || null,
        packageEndDate: netgsmConfig?.packageEndDate || null,
        lastTopupDate: netgsmConfig?.lastTopupDate || null,
        lastTopupAmount: netgsmConfig?.lastTopupAmount || null,
        senderNames: apiSenders.length > 0 ? apiSenders : (netgsmConfig?.senderNames || []),
        lastSentDate: lastSmsCall?.createdAt || null,
        totalSmsPackage: netgsmConfig?.lastTopupAmount || 20000,
        remainingDays
      }
    };
  } catch (error: any) {
    console.error("Failed to fetch API usage stats:", error);
    return { success: false, error: error.message };
  }
}

export async function updateNetgsmConfig(data: {
  packageStartDate: Date | null;
  packageEndDate: Date | null;
  lastTopupDate: Date | null;
  lastTopupAmount: number | null;
}) {
  try {
    if (!prisma.netgsmConfig) {
      return { success: false, error: "Veritabanı güncellendi ancak Next.js geliştirme sunucusu (dev server) yeniden başlatılmadı. Lütfen terminalden 'npm run dev' işlemini durdurup tekrar başlatın." };
    }
    const config = await prisma.netgsmConfig.upsert({
      where: { tenantId: 'teknikel' },
      update: {
        packageStartDate: data.packageStartDate,
        packageEndDate: data.packageEndDate,
        lastTopupDate: data.lastTopupDate,
        lastTopupAmount: data.lastTopupAmount,
      },
      create: {
        tenantId: 'teknikel',
        packageStartDate: data.packageStartDate,
        packageEndDate: data.packageEndDate,
        lastTopupDate: data.lastTopupDate,
        lastTopupAmount: data.lastTopupAmount,
      }
    });
    return { success: true, data: config };
  } catch (error: any) {
    console.error("Failed to update NetGSM config:", error);
    return { success: false, error: error.message };
  }
}
