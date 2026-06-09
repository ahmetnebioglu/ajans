"use client";

import React from "react";
import { Card, Row, Col, Button, Tag } from "antd";
import { Building2, MapPin, Phone, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

const COMPANIES = [
  { 
    id: "comp1", 
    name: "Mercan Grup Lojistik A.Ş.", 
    taxNumber: "1234567890", 
    address: "İkitelli OSB, Atatürk Cd. No:45 Başakşehir/İstanbul", 
    phone: "0212 555 12 34",
    status: "AKTİF"
  },
  { 
    id: "comp2", 
    name: "Tekno Lojistik Limited Şirketi", 
    taxNumber: "0987654321", 
    address: "Çiğli OSB, 10002 Sk. No:12 Çiğli/İzmir", 
    phone: "0232 444 56 78",
    status: "AKTİF"
  }
];

export default function CompaniesListPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 italic font-medium">
      <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800 pb-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
               <Building2 className="inline-block text-indigo-600 mr-4" size={36} />
               FİRMALARIM
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Yönetiminiz altındaki tüm şirketler ve detayları</p>
         </div>
      </div>

      <Row gutter={[24, 24]}>
        {COMPANIES.map((company) => (
          <Col xs={24} lg={12} key={workspace.id}>
             <Card 
               className="group hover:border-indigo-500 transition-all border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-xl overflow-hidden"
               bodyStyle={{ padding: 0 }}
             >
                <div className="flex flex-col md:flex-row">
                   <div className="w-full md:w-32 bg-slate-50 dark:bg-zinc-950 flex items-center justify-center p-6 border-r border-slate-100 dark:border-zinc-800">
                      <Building2 size={48} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                   </div>
                   <div className="flex-1 p-6 space-y-4">
                      <div className="flex justify-between items-start">
                         <div className="space-y-1">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase leading-none tracking-tight">{workspace.name}</h3>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">VKN: {workspace.taxNumber}</div>
                         </div>
                         <Tag color="green" className="m-0 font-black text-[9px] uppercase tracking-widest border-none px-3">{workspace.status}</Tag>
                      </div>

                      <div className="space-y-2">
                         <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
                            <MapPin size={14} className="text-indigo-500" /> {workspace.address}
                         </div>
                         <div className="flex items-center gap-2 text-[11px] text-slate-500 italic">
                            <Phone size={14} className="text-indigo-500" /> {workspace.phone}
                         </div>
                      </div>

                      <div className="pt-4 flex gap-3 border-t border-slate-100 dark:border-zinc-800">
                         <Link href={`/customer-portal/companies/${workspace.id}`} className="flex-1">
                            <Button block type="primary" className="h-10 bg-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                               DETAYLARI YÖNET <ExternalLink size={14} />
                            </Button>
                         </Link>
                         <Button className="h-10 border-slate-200 dark:border-zinc-700 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                            RAPORLAR <FileText size={14} />
                         </Button>
                      </div>
                   </div>
                </div>
             </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
