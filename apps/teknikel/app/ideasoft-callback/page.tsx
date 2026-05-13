"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircleFilled, CloseCircleFilled, LoadingOutlined } from "@ant-design/icons";
import { Button, Result, Spin } from "antd";
import Link from "next/link";

/**
 * IdeaSoft OAuth2 Callback Sayfası
 * 
 * IdeaSoft yetkilendirme sonrası bu sayfaya yönlendirilir.
 * URL parametrelerinden code + state alınır, API route'a POST edilir,
 * access_token + refresh_token veritabanına kaydedilir.
 * 
 * redirect_uri: https://teknikel.vercel.app/ideasoft-callback
 */
export default function IdeasoftCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const processed = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("IdeaSoft yetkilendirmesi işleniyor...");

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const domain = searchParams.get("domain");

  useEffect(() => {
    if (processed.current) return;
    if (!code || !state) {
      setStatus("error");
      setMessage("Geçersiz callback parametreleri. code veya state eksik.");
      return;
    }

    processed.current = true;

    const processCallback = async () => {
      try {
        const response = await fetch("/api/ideasoft/callback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, state, domain }),
        });

        const data = await response.json();

        if (response.ok && data.status === "success") {
          setStatus("success");
          setMessage("IdeaSoft yetkilendirmesi başarıyla tamamlandı. Token veritabanına kaydedildi.");
        } else {
          setStatus("error");
          setMessage(data.error || "Token alınırken bir hata oluştu.");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage("Bağlantı hatası: " + err.message);
      }
    };

    processCallback();
  }, [code, state, domain]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-4">{message}</p>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Result
          status="success"
          icon={<CheckCircleFilled style={{ color: "#22c55e", fontSize: 64 }} />}
          title="IdeaSoft Bağlantısı Kuruldu!"
          subTitle={
            <div className="space-y-2">
              <p>{message}</p>
              <p className="text-xs text-slate-400">
                Bundan sonra token yenileme işlemi arka planda otomatik gerçekleşecektir.
              </p>
            </div>
          }
          extra={[
            <Button type="primary" key="settings">
              <Link href="/settings">Ayarlara Dön</Link>
            </Button>,
            <Button key="home">
              <Link href="/">Ana Sayfaya Git</Link>
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <Result
        status="error"
        icon={<CloseCircleFilled style={{ color: "#ef4444", fontSize: 64 }} />}
        title="Yetkilendirme Başarısız"
        subTitle={
          <div className="space-y-2">
            <p>{message}</p>
            <p className="text-xs text-slate-400">
              Lütfen tekrar deneyin veya IdeaSoft yöneticisiyle iletişime geçin.
            </p>
          </div>
        }
        extra={[
          <Button type="primary" key="settings">
            <Link href="/settings">Ayarlara Dön</Link>
          </Button>,
        ]}
      />
    </div>
  );
}
