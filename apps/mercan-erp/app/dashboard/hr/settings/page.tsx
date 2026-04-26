"use client";

import React from "react";
import { Card, Typography, Switch, Form, Button, Divider, message } from "antd";
import { Settings as SettingsIcon, Bell, Shield, Database } from "lucide-react";

const { Title, Text } = Typography;

export default function HRSettingsPage() {
  const onFinish = () => {
    message.success("İK Ayarları başarıyla güncellendi");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 italic font-medium">
      <div className="flex flex-col md:flex-row justify-between items-end gap-3 border-b border-indigo-100 dark:border-zinc-800 pb-6">
         <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic">İK <span className="text-indigo-600">Ayarları</span></h1>
            <p className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-[9px]">Modül konfigürasyonu ve yetkilendirme</p>
         </div>
      </div>

      <Card className="shadow-2xl border-none">
        <Form layout="vertical" onFinish={onFinish}>
          <div className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={18} className="text-indigo-600" />
                <Text className="text-[12px] font-black uppercase tracking-widest">Bildirim Ayarları</Text>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-[4px]">
                  <div>
                    <div className="text-[11px] font-black uppercase">Yeni Başvuru Bildirimi</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">Aday başvuru yaptığında İK uzmanına mail gönder</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-[4px]">
                  <div>
                    <div className="text-[11px] font-black uppercase">İzin Talebi Onayı</div>
                    <div className="text-[9px] text-slate-400 uppercase tracking-widest">İzin onaylandığında personele push bildirimi gönder</div>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </section>

            <Divider className="my-0" />

            <section>
              <div className="flex items-center gap-2 mb-4">
                <Shield size={18} className="text-indigo-600" />
                <Text className="text-[12px] font-black uppercase tracking-widest">Güvenlik & Yetki</Text>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-800/50 rounded-[4px]">
                <div>
                  <div className="text-[11px] font-black uppercase">KVKK Uyumluluk Modu</div>
                  <div className="text-[9px] text-slate-400 uppercase tracking-widest">Aday verilerini 6 ay sonunda otomatik anonimleştir</div>
                </div>
                <Switch />
              </div>
            </section>

            <div className="text-right pt-4">
              <Button type="primary" htmlType="submit" className="bg-indigo-600 text-[10px] font-black uppercase tracking-widest h-10 px-8">
                Değişiklikleri Kaydet
              </Button>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
}
