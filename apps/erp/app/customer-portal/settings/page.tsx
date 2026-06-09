"use client";

import React from "react";
import { Card, Form, Input, Button, Switch, Divider, message, Row, Col } from "antd";
import { User, Bell, Lock, Shield, Save, Mail, Settings } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CustomerSettingsPage() {
  const { data: session } = useSession();
  const [form] = Form.useForm();
  const router = useRouter();

  const onFinish = (values: any) => {
    message.success({
      content: "Ayarlar başarıyla kaydedildi.",
      className: "italic font-bold uppercase text-[10px]"
    });
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700 italic font-medium">
      <div className="flex flex-col md:flex-row justify-between items-end gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
         <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none italic flex items-center gap-4">
              <Settings className="text-indigo-600" size={32} />
              Hesap <span className="text-indigo-600">Ayarları</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Portal bildirimleri ve güvenlik tercihlerini yönetin</p>
         </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ name: session?.user?.name, email: session?.user?.email }}>
        <Row gutter={24}>
           <Col xs={24} lg={16}>
              <div className="space-y-6">
                 {/* PROFILE SECTION */}
                 <Card className="shadow-xl border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                       <User size={16} className="text-indigo-600" /> Profil Bilgileri
                    </h3>
                    <Row gutter={16}>
                       <Col span={12}>
                          <Form.Item name="name" label={<span className="text-[10px] font-black uppercase text-slate-400">Ad Soyad</span>}>
                             <Input className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold text-slate-900 dark:text-white" />
                          </Form.Item>
                       </Col>
                       <Col span={12}>
                          <Form.Item name="email" label={<span className="text-[10px] font-black uppercase text-slate-400">E-posta</span>}>
                             <Input disabled prefix={<Mail size={14} />} className="h-12 bg-slate-50 dark:bg-zinc-950 font-bold opacity-50 text-slate-900 dark:text-white" />
                          </Form.Item>
                       </Col>
                    </Row>
                 </Card>

                 {/* NOTIFICATIONS SECTION */}
                 <Card className="shadow-xl border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 flex items-center gap-2">
                       <Bell size={16} className="text-indigo-600" /> Bildirim Tercihleri
                    </h3>
                    <div className="space-y-4">
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-[4px] border border-slate-100 dark:border-zinc-800">
                          <div>
                             <div className="text-[11px] font-black uppercase text-slate-900 dark:text-white">E-posta Bildirimleri</div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Raporlar hazırlandığında e-posta al</div>
                          </div>
                          <Switch defaultChecked />
                       </div>
                       <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-zinc-950/50 rounded-[4px] border border-slate-100 dark:border-zinc-800">
                          <div>
                             <div className="text-[11px] font-black uppercase text-slate-900 dark:text-white">Sistem Duyuruları</div>
                             <div className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Önemli güncellemeler hakkında bilgi al</div>
                          </div>
                          <Switch defaultChecked />
                       </div>
                    </div>
                 </Card>
              </div>
           </Col>

           <Col xs={24} lg={8}>
              <div className="space-y-6">
                 <Card className="bg-indigo-600 text-white border-none shadow-2xl">
                    <h4 className="text-lg font-black uppercase tracking-tighter italic mb-4">AYARLARI KAYDET</h4>
                    <p className="text-[10px] text-indigo-100 font-bold uppercase tracking-widest leading-relaxed mb-6">
                       Yapılan değişiklikler anında hesabınıza yansıtılacaktır.
                    </p>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      block 
                      className="h-12 bg-white text-indigo-600 border-none font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 shadow-xl"
                    >
                       GÜNCELLE <Save size={16} className="ml-2" />
                    </Button>
                 </Card>

                 <Card className="shadow-xl border-slate-200 dark:border-zinc-800 dark:bg-zinc-900">
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4 flex items-center gap-2">
                       <Lock size={16} className="text-rose-600" /> Güvenlik
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none italic mb-4">Oturumlarınızı yönetmek için oturum yönetimi sayfasını kullanın.</p>
                    <Button block className="h-10 font-black text-[9px] uppercase tracking-widest" onClick={() => router.push("/customer-portal/sessions")}>OTURUMLARI GÖR</Button>
                 </Card>
              </div>
           </Col>
        </Row>
      </Form>
    </div>
  );
}
