"use client";

import React from "react";
import { Typography, Card, Table, Tag, Button } from "antd";
import { UserPlus, Search, Filter } from "lucide-react";

const { Title, Text } = Typography;

export default function LeadsPage() {
  return (
    <div className="p-8 space-y-6 italic font-medium">
      <div className="flex justify-between items-end border-b border-red-100 pb-6">
        <div>
          <Title level={2} className="!m-0 !font-black !tracking-tighter uppercase italic">Müşteri <span className="text-red-600">Adayları (Leads)</span></Title>
          <Text className="text-slate-400 font-bold uppercase tracking-widest text-[9px]">Potansiyel müşteriler ve talep yönetimi</Text>
        </div>
        <Button type="primary" danger icon={<UserPlus size={16} />} className="h-10 font-black uppercase tracking-widest text-[10px]">Yeni Aday Ekle</Button>
      </div>
      
      <Card className="shadow-sm border-slate-100">
        <div className="p-20 text-center">
          <div className="text-slate-300 mb-4 flex justify-center"><Search size={48} /></div>
          <Text className="text-slate-400 uppercase font-black tracking-[0.3em] text-[10px]">Henüz aday kaydı bulunmuyor</Text>
        </div>
      </Card>
    </div>
  );
}
