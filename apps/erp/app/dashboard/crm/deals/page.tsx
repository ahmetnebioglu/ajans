"use client";

import React from "react";
import { Typography, Card } from "antd";
import { LineChart } from "lucide-react";

const { Title, Text } = Typography;

export default function DealsPage() {
  return (
    <div className="p-8 space-y-6 italic font-medium">
      <div className="flex justify-between items-end border-b border-red-100 pb-6">
        <div>
          <Title level={2} className="!m-0 !font-black !tracking-tighter uppercase italic">Satış <span className="text-red-600">Boru Hattı (Deals)</span></Title>
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Aktif satış fırsatları ve aşama takibi</Text>
        </div>
      </div>
      <Card className="shadow-sm border-slate-100">
        <div className="p-20 text-center">
          <div className="text-slate-300 mb-4 flex justify-center"><LineChart size={48} /></div>
          <Text className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px]">Aktif satış fırsatı bulunmuyor</Text>
        </div>
      </Card>
    </div>
  );
}
