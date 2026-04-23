"use client";

import React, { useState } from "react";
import { Clock, Users, ShieldAlert, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DangerLevel = "AZ_TEHLIKELI" | "TEHLIKELI" | "COK_TEHLIKELI";

interface CalculatorCardProps {
  title: string;
  calculateFn: (count: number, level: DangerLevel) => number;
  levels: { label: string; value: DangerLevel }[];
  resultLabel: string;
}

function CalculatorCard({ title, calculateFn, levels, resultLabel }: CalculatorCardProps) {
  const [count, setCount] = useState<string>("");
  const [level, setLevel] = useState<DangerLevel>(levels[0].value);
  const [result, setResult] = useState<number | null>(null);

  const handleCalculate = () => {
    const numCount = parseInt(count);
    if (!isNaN(numCount) && numCount > 0) {
      const calculatedResult = calculateFn(numCount, level);
      setResult(calculatedResult);
      
      // Push to DataLayer
      if (typeof window !== "undefined") {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "calculate_isg_time",
          tool: title,
          hazard_class: level,
          employee_count: numCount,
          result_minutes: calculatedResult,
        });
      }
    } else {
      setResult(null);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-6 hover:shadow-2xl transition-all duration-500 group">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:rotate-3 transition-transform">
        <Zap size={28} />
      </div>
      
      <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
        {title}
      </h3>

      <div className="w-full space-y-4">
        <div className="space-y-2">
          <select 
            value={level}
            onChange={(e) => setLevel(e.target.value as DangerLevel)}
            className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-6 text-sm font-bold italic focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all cursor-pointer appearance-none"
          >
            {levels.map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <input 
            type="number"
            placeholder="Çalışan sayısı giriniz"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full h-14 rounded-2xl border border-slate-200 bg-slate-50 px-6 text-sm font-bold italic focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-600 transition-all placeholder:text-slate-400"
          />
        </div>

        <Button 
          onClick={handleCalculate}
          className="w-full h-14 bg-[#2ecc71] hover:bg-[#27ae60] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-lg shadow-green-500/20 active:scale-95 transition-all"
        >
          Hesapla
        </Button>
      </div>

      <div className={`w-full pt-4 transition-all duration-500 ${result !== null ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
        <div className="p-8 bg-blue-50 rounded-[2rem] border border-blue-100">
           <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">{resultLabel}</p>
           <div className="text-4xl font-black text-slate-900 tracking-tighter italic">
              {result === 0 ? (
                <span className="text-rose-600">Gerekli Değil</span>
              ) : (
                <>
                  {(result ? (result / 60).toFixed(1) : 0)} <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Saat/Ay</span>
                </>
              )}
           </div>
           {result !== 0 && (
             <div className="mt-2 text-[10px] font-bold text-slate-400 uppercase">
                Toplam: {result} Dakika
             </div>
           )}
        </div>
      </div>
      
      {result === null && (
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">
           Çalışan sayısı giriniz
        </p>
      )}
    </div>
  );
}

export function IsgDurationCalculator() {
  const iguLevels = [
    { label: "Az Tehlikeli İşyeri", value: "AZ_TEHLIKELI" as DangerLevel },
    { label: "Tehlikeli İşyeri", value: "TEHLIKELI" as DangerLevel },
    { label: "Çok Tehlikeli İşyeri", value: "COK_TEHLIKELI" as DangerLevel },
  ];

  const ihLevels = [
    { label: "Az Tehlikeli İşyeri", value: "AZ_TEHLIKELI" as DangerLevel },
    { label: "Tehlikeli İşyeri", value: "TEHLIKELI" as DangerLevel },
    { label: "Çok Tehlikeli İşyeri", value: "COK_TEHLIKELI" as DangerLevel },
  ];

  const dspLevels = [
    { label: "Çok Tehlikeli", value: "COK_TEHLIKELI" as DangerLevel },
  ];

  const calculateIgu = (count: number, level: DangerLevel) => {
    const coeffs = { AZ_TEHLIKELI: 10, TEHLIKELI: 20, COK_TEHLIKELI: 40 };
    return count * coeffs[level];
  };

  const calculateIh = (count: number, level: DangerLevel) => {
    const coeffs = { AZ_TEHLIKELI: 5, TEHLIKELI: 10, COK_TEHLIKELI: 15 };
    return count * coeffs[level];
  };

  const calculateDsp = (count: number, level: DangerLevel) => {
    if (level !== "COK_TEHLIKELI") return 0;
    if (count < 10) return 0;
    if (count < 50) return count * 10;
    if (count < 250) return count * 15;
    return count * 20;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
      <CalculatorCard 
        title="İş Güvenliği Uzmanı" 
        calculateFn={calculateIgu}
        levels={iguLevels}
        resultLabel="Zorunlu Çalışma Süresi"
      />
      <CalculatorCard 
        title="İşyeri Hekimi" 
        calculateFn={calculateIh}
        levels={ihLevels}
        resultLabel="Zorunlu Çalışma Süresi"
      />
      <CalculatorCard 
        title="Diğer Sağlık Personeli" 
        calculateFn={calculateDsp}
        levels={dspLevels}
        resultLabel="Zorunlu Çalışma Süresi"
      />
    </div>
  );
}
