"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert, CheckCircle2, XCircle } from "lucide-react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem("mercan_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    } else {
      // Apply consent mode if already accepted
      applyConsent(consent === "all");
    }
  }, []);

  const applyConsent = (acceptAll: boolean) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "cookie_consent_update",
        consent_status: acceptAll ? "granted" : "denied",
      });

      // Update Google Consent Mode if configured
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      gtag("consent", "update", {
        ad_storage: acceptAll ? "granted" : "denied",
        analytics_storage: acceptAll ? "granted" : "denied",
        ad_user_data: acceptAll ? "granted" : "denied",
        ad_personalization: acceptAll ? "granted" : "denied",
      });
    }
  };

  const handleAcceptAll = () => {
    localStorage.setItem("mercan_cookie_consent", "all");
    applyConsent(true);
    setShowBanner(false);
  };

  const handleAcceptNecessary = () => {
    localStorage.setItem("mercan_cookie_consent", "necessary");
    applyConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 pointer-events-none flex justify-center animate-in slide-in-from-bottom-5 duration-500">
      <div className="bg-white text-slate-900 p-4 sm:p-5 rounded-3xl shadow-2xl w-full max-w-4xl border border-slate-200 pointer-events-auto relative overflow-hidden flex flex-col md:flex-row items-center gap-4 md:gap-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />

        <div className="flex items-start gap-4 flex-1 pt-1">
          <div className="bg-slate-100 p-2.5 rounded-xl shrink-0 hidden sm:block">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-black uppercase tracking-tight italic flex items-center gap-1.5 mb-1 text-slate-900">
              <span className="sm:hidden text-emerald-600">
                <ShieldAlert className="w-4 h-4" />
              </span>
              KVKK & Çerezler
            </h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xl">
              Deneyiminizi iyileştirmek için çerezler kullanıyoruz. Detaylar
              için{" "}
              <a
                href="/kvkk-aydinlatma"
                className="text-emerald-600 hover:text-emerald-700 underline underline-offset-2 decoration-emerald-600/30 transition-colors font-bold"
              >
                Politikamızı
              </a>{" "}
              inceleyebilirsiniz.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
          <Button
            onClick={handleAcceptNecessary}
            variant="outline"
            className="flex-1 md:flex-none bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl h-10 px-4 text-xs font-bold transition-all"
          >
            Sadece Zorunlu
          </Button>
          <Button
            onClick={handleAcceptAll}
            className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-10 px-5 text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95 border-none"
          >
            Tümünü Kabul Et
          </Button>
        </div>
      </div>
    </div>
  );
}
