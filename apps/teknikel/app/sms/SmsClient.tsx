"use client";

import React, { useState, useEffect } from "react";
import { Card, Progress, Spin, Alert, Tag, Row, Col, Statistic } from "antd";
import { MessageSquare, Calendar, CreditCard, Send, Radio, Building2 } from "lucide-react";
import { useTheme } from "next-themes";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface CreditInfo {
  packageName: string;
  companyName: string;
  accountStatus: string;
  remainingCredits: number;
  usedCredits: number;
  totalCredits: number;
  creditPercentage: number;
  startDate: string;
  endDate: string;
  lastSentDate: string;
  lastRechargeDate: string;
  lastRechargeAmount: number;
  senderNames: string[];
}

const formatNumber = (number: number) => {
  return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "0";
};

const formatDate = (dateString: string) => {
  try {
    if (!dateString) return "Belirtilmemiş";
    return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
  } catch {
    return "Geçersiz tarih";
  }
};

const formatDateTime = (dateString: string) => {
  try {
    if (!dateString) return "Belirtilmemiş";
    return format(new Date(dateString), "dd MMMM yyyy HH:mm", { locale: tr });
  } catch {
    return "Geçersiz tarih";
  }
};

export default function SmsClient() {
  const [loading, setLoading] = useState(true);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const fetchCreditInfo = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/ideasoft/sms/credit");
      const data = await response.json();

      if (data && data.status === "success") {
        setCreditInfo(data.data);
      } else {
        throw new Error(data.message || "API yanıtı başarısız");
      }
    } catch (err: any) {
      console.error("SMS kredi bilgisi alınırken hata:", err);
      setError("SMS kredi bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreditInfo();
  }, []);

  const getCreditStatusColor = (percentage: number): string => {
    if (percentage < 20) return "#ff4d4f";
    if (percentage < 50) return "#faad14";
    return "#52c41a";
  };

  const getProgressStatus = (percentage: number): "success" | "exception" | "normal" => {
    if (percentage < 20) return "exception";
    if (percentage > 80) return "success";
    return "normal";
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
          SMS Paket Bilgileri
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          NetGSM SMS paket ve kredi bilgileri
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Spin size="large" />
        </div>
      ) : error ? (
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
          className="max-w-2xl mx-auto"
        />
      ) : creditInfo ? (
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Paket Bilgi Kartı */}
          <Card
            className={isDark ? "bg-zinc-900 border-white/10" : ""}
            styles={{ body: { padding: 24 } }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <MessageSquare size={20} className="text-blue-500" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                    {creditInfo.packageName}
                  </h2>
                  <p className={`text-sm ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {creditInfo.companyName}
                  </p>
                </div>
              </div>
              <Tag color={creditInfo.accountStatus === "active" ? "success" : "error"}>
                {creditInfo.accountStatus === "active" ? "Aktif" : "Pasif"}
              </Tag>
            </div>

            {/* Bakiye Progress */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  SMS Bakiye Durumu
                </span>
                <span className="text-sm font-bold" style={{ color: getCreditStatusColor(creditInfo.creditPercentage) }}>
                  %{creditInfo.creditPercentage}
                </span>
              </div>
              <Progress
                percent={creditInfo.creditPercentage}
                status={getProgressStatus(creditInfo.creditPercentage)}
                strokeColor={getCreditStatusColor(creditInfo.creditPercentage)}
                showInfo={false}
                size={["100%", 12]}
              />
              <Row justify="space-between" className="mt-2">
                <Col>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Kullanılan: <strong>{formatNumber(creditInfo.usedCredits)}</strong>
                  </span>
                </Col>
                <Col>
                  <span className="text-xs font-bold" style={{ color: getCreditStatusColor(creditInfo.creditPercentage) }}>
                    Kalan: {formatNumber(creditInfo.remainingCredits)}
                  </span>
                </Col>
                <Col>
                  <span className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Toplam: <strong>{formatNumber(creditInfo.totalCredits)}</strong>
                  </span>
                </Col>
              </Row>
            </div>
          </Card>

          {/* İstatistik Kartları */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card className={isDark ? "bg-zinc-900 border-white/10" : ""} size="small">
                <Statistic
                  title={<span className={isDark ? "text-slate-400" : ""}>Kalan Kredi</span>}
                  value={creditInfo.remainingCredits}
                  formatter={(value) => formatNumber(Number(value))}
                  styles={{ content: { color: getCreditStatusColor(creditInfo.creditPercentage), fontWeight: 700 } }}
                  suffix="SMS"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={isDark ? "bg-zinc-900 border-white/10" : ""} size="small">
                <Statistic
                  title={<span className={isDark ? "text-slate-400" : ""}>Kullanılan</span>}
                  value={creditInfo.usedCredits}
                  formatter={(value) => formatNumber(Number(value))}
                  styles={{ content: { fontWeight: 700 } }}
                  suffix="SMS"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={isDark ? "bg-zinc-900 border-white/10" : ""} size="small">
                <Statistic
                  title={<span className={isDark ? "text-slate-400" : ""}>Toplam Paket</span>}
                  value={creditInfo.totalCredits}
                  formatter={(value) => formatNumber(Number(value))}
                  styles={{ content: { fontWeight: 700 } }}
                  suffix="SMS"
                />
              </Card>
            </Col>
          </Row>

          {/* Detay Bilgileri */}
          <Card
            title={
              <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                Paket Detayları
              </span>
            }
            className={isDark ? "bg-zinc-900 border-white/10" : ""}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Calendar size={14} /> Paket Başlangıç
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {formatDate(creditInfo.startDate)}
                </span>
              </div>
              
              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Calendar size={14} /> Paket Bitiş
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {formatDate(creditInfo.endDate)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Send size={14} /> Son Gönderim
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {formatDateTime(creditInfo.lastSentDate)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <CreditCard size={14} /> Son Yükleme
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {formatDate(creditInfo.lastRechargeDate)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Building2 size={14} /> Son Yükleme Miktarı
                </span>
                <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>
                  {formatNumber(creditInfo.lastRechargeAmount)} SMS
                </span>
              </div>

              <div className="flex flex-col">
                <span className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <Radio size={14} /> Gönderici Adları
                </span>
                <div className="flex flex-wrap gap-1">
                  {Array.isArray(creditInfo.senderNames) && creditInfo.senderNames.length > 0
                    ? creditInfo.senderNames.map((name) => (
                        <Tag key={name} color="blue" className="m-0">
                          {name}
                        </Tag>
                      ))
                    : <span className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-700"}`}>Belirtilmemiş</span>}
                </div>
              </div>
            </div>
          </Card>

          {/* Düşük Bakiye Uyarısı */}
          {creditInfo.creditPercentage < 20 && (
            <Alert
              message="Düşük SMS Bakiyesi"
              description="SMS bakiyeniz azalmaktadır. Lütfen yeni SMS paketi satın alınız."
              type="warning"
              showIcon
            />
          )}
        </div>
      ) : null}
    </div>
  );
}
