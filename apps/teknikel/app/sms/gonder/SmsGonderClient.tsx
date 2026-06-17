"use client";

import React, { useState } from "react";
import { Card, Input, Button, message, Alert } from "antd";
import { Send, Phone, MessageSquare } from "lucide-react";
import { useTheme } from "next-themes";

const { TextArea } = Input;

export default function SmsGonderClient() {
  const [receiver, setReceiver] = useState("");
  const [msgTxt, setMsgTxt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  // Karakter sayacı hesaplama
  const charCount = msgTxt.length;
  const smsSegments = charCount === 0 ? 0 : charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const isValidPhone = receiver.length === 0 || /^[0-9]{10}$/.test(receiver);
  const canSubmit = receiver.length === 10 && msgTxt.trim().length > 0 && isValidPhone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) return;

    try {
      setSubmitting(true);

      const response = await fetch("/api/ideasoft/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reciever: receiver,
          msgTxt: msgTxt,
          smsType: "manual",
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        messageApi.success("SMS başarıyla gönderildi!");
        setReceiver("");
        setMsgTxt("");
      } else {
        messageApi.error(result.message || "SMS gönderimi başarısız oldu!");
      }
    } catch (error: any) {
      messageApi.error(
        "SMS gönderimi sırasında bir hata oluştu: " + (error.message || "Bilinmeyen hata")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      {contextHolder}

      {/* Header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
          SMS Gönder
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          NetGSM üzerinden tekli SMS gönderimi
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        <Card
          className={isDark ? "bg-zinc-900 border-white/10" : ""}
          styles={{ body: { padding: 28 } }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Send size={20} className="text-emerald-500" />
            </div>
            <div>
              <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-800"}`}>
                Yeni SMS
              </h2>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Alıcı numarasını ve mesajınızı girin
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Telefon Numarası */}
            <div className="mb-5">
              <label
                className={`text-xs font-semibold block mb-1.5 ${isDark ? "text-slate-300" : "text-slate-600"}`}
              >
                Alıcı Telefon Numarası
              </label>
              <Input
                prefix={<Phone size={16} className="text-slate-400 mr-1" />}
                placeholder="5XX XXX XX XX"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value.replace(/\D/g, "").slice(0, 10))}
                maxLength={10}
                size="large"
                disabled={submitting}
                status={receiver.length > 0 && !isValidPhone ? "error" : undefined}
              />
              <p className={`text-[11px] mt-1 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                Başında 0 olmadan 10 haneli telefon numarası giriniz (örn: 5XX XXX XXXX)
              </p>
              {receiver.length > 0 && !isValidPhone && (
                <p className="text-[11px] mt-0.5 text-red-500">
                  Geçerli bir telefon numarası giriniz
                </p>
              )}
            </div>

            {/* Mesaj İçeriği */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}
                >
                  Mesaj İçeriği
                </label>
                <span className={`text-[11px] font-mono ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  {charCount} karakter • {smsSegments} SMS
                </span>
              </div>
              <TextArea
                placeholder="Mesajınızı buraya yazınız..."
                value={msgTxt}
                onChange={(e) => setMsgTxt(e.target.value)}
                rows={5}
                disabled={submitting}
                showCount
                maxLength={918}
              />
            </div>

            {/* SMS Segment Uyarısı */}
            {smsSegments > 1 && (
              <Alert
                message={`Bu mesaj ${smsSegments} SMS olarak gönderilecektir`}
                type="info"
                showIcon
                className="mb-4"
                style={{ fontSize: 12 }}
              />
            )}

            {/* Gönder Butonu */}
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={submitting}
              disabled={!canSubmit}
              icon={<Send size={16} />}
            >
              {submitting ? "Gönderiliyor..." : "SMS Gönder"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
