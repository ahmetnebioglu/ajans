"use client";

import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  Divider,
  App,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

const { Title, Text } = Typography;

export default function LoginPage() {
  const { message } = App.useApp();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (res?.ok) {
        window.location.href = "/";
      } else {
        setLoading(false);
        message.error("Giriş başarısız: " + (res?.error || "Bilgilerinizi kontrol edin."));
      }
    } catch (error) {
      setLoading(false);
      message.error("Bir hata oluştu, lütfen tekrar deneyin.");
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px]"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary shadow-xl shadow-primary/20 mb-4 rotate-3">
            <span className="text-white text-3xl font-black italic">T</span>
          </div>
          <Title
            level={2}
            className="m-0 !font-black tracking-tighter uppercase italic leading-none"
          >
            Teknikel <span className="text-primary">Kombi</span>
          </Title>
          <div className="flex flex-col gap-1 mt-2">
            <Text className="text-slate-800 dark:text-white font-black uppercase text-[11px] tracking-[0.3em]">
              Merkezi İşletim Sistemi
            </Text>
            <Text className="text-slate-400 font-medium uppercase text-[9px] tracking-wider">
              CRM • E-TİCARET • ÖN MUHASEBE • STOK & DEPO
            </Text>
          </div>
        </div>

        <Card className="shadow-2xl border-none overflow-hidden rounded-3xl dark:bg-zinc-900">
          <div className="p-4 sm:p-6">
            <Title level={4} className="mb-6 !font-bold text-center">
              Giriş Yap
            </Title>

            <Form
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Lütfen e-posta adresinizi girin!",
                  },
                  {
                    type: "email",
                    message: "Geçerli bir e-posta adresi girin!",
                  },
                ]}
              >
                <Input
                  prefix={<UserOutlined className="text-slate-400" />}
                  placeholder="E-posta"
                  className="rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: "Lütfen şifrenizi girin!" }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-slate-400" />}
                  placeholder="Şifre"
                  className="rounded-xl border-slate-100 bg-slate-50/50 hover:bg-white focus:bg-white transition-all"
                />
              </Form.Item>

              <div className="flex justify-end mb-2">
                <Button
                  type="link"
                  size="small"
                  className="p-0 text-xs font-bold text-slate-400 hover:text-primary"
                >
                  Şifremi Unuttum
                </Button>
              </div>

              <Form.Item className="mb-4">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="h-12 rounded-xl bg-primary font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                >
                  Oturum Aç <ArrowRightOutlined />
                </Button>
              </Form.Item>
            </Form>


          </div>

          <div className="bg-slate-50 dark:bg-zinc-800/50 p-6 text-center border-t border-slate-100 dark:border-zinc-800">
            <Text className="text-xs text-slate-400">
              Hesabınız yok mu?{" "}
              <Button type="link" className="p-0 font-bold text-xs h-auto">
                Bize Başvurun
              </Button>
            </Text>
          </div>
        </Card>

        <div className="text-center mt-8">
          <Text className="text-[10px] text-slate-400 uppercase font-black tracking-[0.2em]">
            © 2026 TEKNİKEL KOMBİ. TÜM HAKLARI SAKLIDIR.
          </Text>
        </div>
      </motion.div>
    </div>
  );
}
