"use client";

import React from "react";
import { Form, Input, Button, Card, Row, Col, Space, Divider, message } from "antd";
import { Building2, Save, ArrowLeft, ShieldCheck, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { updateCompanyDetails } from "../../../actions/customer-actions";

export default function CompanyDetailPage() {
  const params = useParams();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    const res = await updateCompanyDetails(params.id as string, values);
    if (res.success) {
      message.success({
        content: "Firma bilgileri başarıyla güncellendi.",
        className: "italic font-bold uppercase text-[10px]"
      });
    } else {
      message.error("Güncelleme sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 italic font-medium">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
         <div className="space-y-1">
            <Link href="/customer-portal/companies" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 mb-2 uppercase tracking-widest">
               <ArrowLeft size={12} /> Listeye Geri Dön
            </Link>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">
               FİRMA <span className="text-indigo-600">PROFİLİ</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Kurumsal bilgiler ve iletişim detayları yönetimi</p>
         </div>
         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-[4px] border border-emerald-100 dark:border-emerald-800 shadow-sm">
            <ShieldCheck size={14} /> Veri Güvenliği Doğrulandı
         </div>
      </div>

      <Form 
        form={form} 
        layout="vertical" 
        onFinish={onFinish}
        initialValues={{
          name: "Mercan Grup Lojistik A.Ş.",
          taxNumber: "1234567890",
          taxOffice: "İkitelli Vergi Dairesi",
          address: "İkitelli OSB, Atatürk Cd. No:45 Başakşehir/İstanbul",
          phone: "0212 555 12 34",
          email: "info@mercangrup.com"
        }}
      >
        <Row gutter={24}>
           <Col xs={24} lg={16}>
              <Card className="shadow-2xl border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                 <div className="p-0 border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                       <Building2 size={16} className="text-indigo-600" /> Temel Kurumsal Bilgiler
                    </h3>
                 </div>

                 <Row gutter={16}>
                    <Col span={24}>
                       <Form.Item name="name" label={<span className="text-[10px] font-black uppercase text-slate-400">Firma Ünvanı</span>}>
                          <Input className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                    <Col span={12}>
                       <Form.Item name="taxNumber" label={<span className="text-[10px] font-black uppercase text-slate-400">Vergi Numarası</span>}>
                          <Input className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                    <Col span={12}>
                       <Form.Item name="taxOffice" label={<span className="text-[10px] font-black uppercase text-slate-400">Vergi Dairesi</span>}>
                          <Input className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                 </Row>

                 <Divider className="border-slate-100 dark:border-zinc-800" />

                 <div className="p-0 border-b border-slate-100 dark:border-zinc-800 pb-4 mb-6">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2">
                       <MapPin size={16} className="text-indigo-600" /> İletişim ve Adres
                    </h3>
                 </div>

                 <Row gutter={16}>
                    <Col span={24}>
                       <Form.Item name="address" label={<span className="text-[10px] font-black uppercase text-slate-400">Resmi Adres</span>}>
                          <Input.TextArea rows={3} className="bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                    <Col span={12}>
                       <Form.Item name="phone" label={<span className="text-[10px] font-black uppercase text-slate-400">Telefon</span>}>
                          <Input prefix={<Phone size={14} />} className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                    <Col span={12}>
                       <Form.Item name="email" label={<span className="text-[10px] font-black uppercase text-slate-400">E-posta Adresi</span>}>
                          <Input prefix={<Mail size={14} />} className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                       </Form.Item>
                    </Col>
                 </Row>
              </Card>
           </Col>

           <Col xs={24} lg={8}>
              <div className="space-y-6">
                 <Card className="bg-slate-900 text-white shadow-2xl border-none">
                    <div className="space-y-4">
                       <h4 className="text-lg font-black uppercase tracking-tighter italic">BİLGİLERİ GÜNCELLE</h4>
                       <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                          Yaptığınız değişiklikler sistem yöneticisi onayına sunulabilir veya doğrudan güncellenir.
                       </p>
                       <Button 
                         type="primary" 
                         htmlType="submit" 
                         block 
                         className="h-12 bg-indigo-600 hover:bg-indigo-500 border-none font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20"
                       >
                          DEĞİŞİKLİKLERİ KAYDET <Save size={16} className="ml-2" />
                       </Button>
                    </div>
                 </Card>

                 <Card className="border-slate-200 dark:border-zinc-800 dark:bg-zinc-900 shadow-xl">
                    <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Yardım & Destek</h5>
                    <p className="text-[11px] text-slate-500 italic mb-4">Firma bilgilerinde köklü bir değişiklik yapmak için destek talebi oluşturabilirsiniz.</p>
                    <Button block className="h-10 font-bold text-[10px] uppercase">DESTEK TALEBİ AÇ</Button>
                 </Card>
              </div>
           </Col>
        </Row>
      </Form>
    </div>
  );
}
