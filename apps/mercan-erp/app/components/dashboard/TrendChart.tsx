"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface TrendData {
  month: string;
  count: number;
}

export default function TrendChart({ data }: { data: TrendData[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <div className="h-[300px] w-full font-sans italic font-bold">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#1e293b" : "#f1f5f9"} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: isDark ? '#64748b' : '#94a3b8', fontSize: 10, fontWeight: 900 }}
          />
          <Tooltip 
            cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }}
            contentStyle={{ 
                backgroundColor: isDark ? "#0f172a" : "#fff",
                borderRadius: '8px', 
                border: isDark ? '1px solid #1e293b' : 'none', 
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: '900',
                textTransform: 'uppercase'
              }} 
            itemStyle={{ color: isDark ? "#fff" : "#000" }}
          />
          <Bar 
            dataKey="count" 
            radius={[6, 6, 0, 0]} 
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? (isDark ? "#3b82f6" : "#2563eb") : (isDark ? "#334155" : "#94a3b8")} 
                fillOpacity={index === data.length - 1 ? 1 : (isDark ? 0.6 : 0.3)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
