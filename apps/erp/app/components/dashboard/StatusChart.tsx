"use client";

import React from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export default function StatusChart({ data }: { data: StatusData[] }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  if (!mounted) return <div className="h-[300px] w-full" />;

  return (
    <div className="h-[300px] w-full font-sans italic font-bold relative">
      <ResponsiveContainer width="100%" height={300} debounce={100}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
            animationBegin={0}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: isDark ? "#0f172a" : "#fff",
              borderRadius: '8px', 
              border: isDark ? '1px solid #1e293b' : 'none', 
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              fontWeight: '900',
              textTransform: 'uppercase',
              color: isDark ? "#fff" : "#000"
            }} 
            itemStyle={{ color: isDark ? "#fff" : "#000" }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
