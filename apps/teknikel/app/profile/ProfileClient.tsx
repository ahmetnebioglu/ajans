"use client";

import React, { useState } from "react";
import { 
  Card, 
  Avatar, 
  Typography, 
  Button, 
  Form, 
  Input, 
  Divider, 
  Row, 
  Col, 
  Tag, 
  App,
  Upload,
  Space
} from "antd";
import { 
  UserOutlined, 
  MailOutlined, 
  LockOutlined, 
  CameraOutlined,
  SaveOutlined,
  SafetyCertificateOutlined,
  KeyOutlined,
  ArrowLeftOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import { useSession, signOut } from "next-auth/react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateProfile, changePassword } from "../actions/user-actions";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const { logout: authLogout } = useAuth();
  const { message } = App.useApp();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [avatarFile, setAvatarFile] = useState<any>(null);

  const user = session?.user;

  // Form verilerini oturum açıldığında ilklendir
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
      });
    }
  }, [user, form]);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      // Şifre değiştirme işlemi
      if (values.newPassword || values.confirmPassword) {
        if (!values.newPassword) {
          message.error("Lütfen yeni şifrenizi girin.");
          setLoading(false);
          return;
        }
        if (values.newPassword.length < 6) {
          message.error("Şifre en az 6 karakter olmalıdır.");
          setLoading(false);
          return;
        }
        if (values.newPassword !== values.confirmPassword) {
          message.error("Şifreler eşleşmiyor. Lütfen tekrar kontrol edin.");
          setLoading(false);
          return;
        }

        const pwResult = await changePassword(values.newPassword);
        if (!pwResult.success) {
          message.error(pwResult.error || "Şifre güncellenemedi.");
          setLoading(false);
          return;
        }
        message.success("Şifreniz başarıyla güncellendi.");
        form.setFieldsValue({ newPassword: "", confirmPassword: "" });
      }

      // Profil bilgileri güncelleme
      const formData = new FormData();
      formData.append("name", values.name);
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      const result = await updateProfile(formData);

      if (result.success) {
        if (!values.newPassword) {
          // Sadece profil güncellendiyse mesaj göster (şifre mesajı zaten gösterildi)
          message.success("Profil bilgileriniz başarıyla güncellendi.");
        }
        // Session'ı manuel güncelle (next-auth v4 custom session update)
        await update({
          ...session,
          user: {
            ...session?.user,
            name: values.name,
            image: result.imageUrl || session?.user?.image
          }
        });
        setAvatarFile(null);
      } else {
        message.error(result.error || "Güncelleme başarısız.");
      }
    } catch (error) {
      message.error("Güncelleme sırasında bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto flex flex-col gap-6 animate-in fade-in duration-700">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-2">
        <Button 
          icon={<ArrowLeftOutlined />} 
          type="text" 
          onClick={() => router.back()}
          className="hover:bg-slate-100 dark:hover:bg-zinc-800"
        />
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-white uppercase italic tracking-tight">Profil Ayarları</h1>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Kişisel bilgilerinizi ve güvenliğinizi yönetin</p>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* LEFT COLUMN: AVATAR & QUICK INFO */}
        <Col xs={24} lg={8}>
          <Card className="shadow-sm border-slate-100 dark:border-zinc-800 dark:bg-slate-900/50 text-center py-6 h-full">
            <div className="relative inline-block mb-6 group">
              <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl bg-slate-100 flex items-center justify-center relative">
                {avatarFile || user?.image ? (
                  <img 
                    src={avatarFile ? URL.createObjectURL(avatarFile) : user?.image} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserOutlined className="text-4xl text-slate-300" />
                )}
                
                <Upload 
                  showUploadList={false} 
                  beforeUpload={(file) => {
                    setAvatarFile(file);
                    return false;
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  style={{ width: '100%', height: '100%' }}
                >
                  <div className="w-full h-full" />
                </Upload>
              </div>
              
              <div className="absolute bottom-1 right-1 pointer-events-none">
                <Button 
                  shape="circle" 
                  icon={<CameraOutlined />} 
                  size="small" 
                  className="bg-primary text-white border-none shadow-lg"
                />
              </div>
            </div>
            
            <Title level={4} className="mb-1 !font-black uppercase italic tracking-tighter">
              {user?.name || "İsimsiz Kullanıcı"}
            </Title>
            <Text className="text-slate-400 block mb-4 font-bold text-[11px] uppercase tracking-widest">
              {user?.email}
            </Text>
            
            <div className="flex flex-col gap-2 px-4">
              <Tag color="red" className="m-0 font-black uppercase tracking-widest text-[10px] py-1 border-none bg-red-50 dark:bg-red-900/20 text-primary">
                {(session?.user as any)?.role || "PERSONEL"}
              </Tag>
              <div className="bg-slate-50 dark:bg-zinc-950 p-3 rounded-lg border border-slate-100 dark:border-zinc-800 mt-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Hesap Durumu</span>
                  <span className="text-[10px] text-emerald-500 font-black uppercase">Aktif</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Güvenlik</span>
                  <span className="text-[10px] text-blue-500 font-black uppercase flex items-center gap-1">
                    <SafetyCertificateOutlined /> Doğrulanmış
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN: FORM */}
        <Col xs={24} lg={16}>
          <Card className="shadow-sm border-slate-100 dark:border-zinc-800 dark:bg-slate-900/50 h-full">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={{
                name: user?.name,
                email: user?.email,
              }}
              className="premium-form"
            >
              <Divider titlePlacement="left" className="!m-0 !mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Temel Bilgiler</span>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label={<span className="text-xs font-bold uppercase tracking-widest text-slate-500">Ad Soyad</span>} 
                    name="name"
                    rules={[{ required: true, message: 'Lütfen isminizi girin!' }]}
                  >
                    <Input prefix={<UserOutlined className="text-slate-300" />} className="h-11 rounded-md" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label={<span className="text-xs font-bold uppercase tracking-widest text-slate-500">E-posta</span>} 
                    name="email"
                  >
                    <Input prefix={<MailOutlined className="text-slate-300" />} disabled className="h-11 rounded-md opacity-60 bg-slate-50" />
                  </Form.Item>
                </Col>
              </Row>

              <Divider titlePlacement="left" className="!mt-4 !mb-6">
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Şifre Değiştir</span>
              </Divider>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item 
                    label={<span className="text-xs font-bold uppercase tracking-widest text-slate-500">Yeni Şifre</span>} 
                    name="newPassword"
                  >
                    <Input.Password prefix={<LockOutlined className="text-slate-300" />} className="h-11 rounded-md" placeholder="••••••••" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item 
                    label={<span className="text-xs font-bold uppercase tracking-widest text-slate-500">Yeni Şifre (Tekrar)</span>} 
                    name="confirmPassword"
                  >
                    <Input.Password prefix={<KeyOutlined className="text-slate-300" />} className="h-11 rounded-md" placeholder="••••••••" />
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-8 flex flex-wrap justify-between items-center gap-4">
                <Button 
                  danger 
                  type="text"
                  icon={<LogoutOutlined className="w-4 h-4" />}
                  onClick={() => {
                    document.cookie = "auth_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                    authLogout();
                    signOut({ callbackUrl: '/login' });
                  }}
                  className="font-bold uppercase tracking-widest text-[10px]"
                >
                  OTURUMU KAPAT
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                  className="bg-primary h-12 px-8 font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 rounded-md"
                >
                  DEĞİŞİKLİKLERİ KAYDET
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
      
      <style jsx global>{`
        .premium-form .ant-form-item-label {
          padding-bottom: 8px !important;
        }
        .premium-form .ant-input-affix-wrapper {
          border-color: #f1f5f9 !important;
          background: #f8fafc !important;
        }
        .dark .premium-form .ant-input-affix-wrapper {
          border-color: #1e293b !important;
          background: #0f172a !important;
        }
        .premium-form .ant-input-affix-wrapper:hover,
        .premium-form .ant-input-affix-wrapper-focused {
          border-color: hsl(var(--primary)) !important;
          background: #fff !important;
        }
        .dark .premium-form .ant-input-affix-wrapper:hover,
        .dark .premium-form .ant-input-affix-wrapper-focused {
          background: #020617 !important;
        }
      `}</style>
    </div>
  );
}
