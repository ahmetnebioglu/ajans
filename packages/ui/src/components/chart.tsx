"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  BarChart as RechartsBarChart,
  Pie,
  PieChart as RechartsPieChart,
  Area,
  AreaChart as RechartsAreaChart,
  Cell,
} from "recharts"

/**
 * Mercan ERP Uyumlu Basitleştirilmiş Shadcn/Charts Wrapper.
 * Recharts üzerine inşa edilmiştir.
 */

interface ChartProps {
  data: any[]
  index: string
  categories: string[]
  colors?: string[]
  valueFormatter?: (value: number) => string
  className?: string
}

export function BarChart({ data, index, categories, colors = ["#0d9488"], className }: ChartProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey={index} 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
            tickFormatter={(value) => value.toString().toUpperCase()}
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            cursor={{ fill: '#18181b' }}
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '2px', fontSize: '10px' }}
          />
          {categories.map((category, i) => (
            <Bar 
              key={category} 
              dataKey={category} 
              fill={colors[i % colors.length]} 
              radius={[2, 2, 0, 0]} 
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PieChart({ data, index, category, colors = ["#0d9488", "#0891b2", "#0284c7", "#4f46e5"], className }: { data: any[], index: string, category: string, colors?: string[], className?: string }) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            dataKey={category}
            nameKey={index}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '2px', fontSize: '10px' }}
          />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function AreaChart({ data, index, categories, colors = ["#0d9488"], className }: ChartProps) {
  return (
    <div className={`w-full h-64 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          <defs>
            {categories.map((cat, i) => (
              <linearGradient key={`gradient-${cat}`} id={`color${cat}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[i % colors.length]} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={colors[i % colors.length]} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
          <XAxis 
            dataKey={index} 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <YAxis 
            stroke="#52525b" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '2px', fontSize: '10px' }}
          />
          {categories.map((category, i) => (
            <Area 
              key={category} 
              type="monotone" 
              dataKey={category} 
              stroke={colors[i % colors.length]} 
              fillOpacity={1} 
              fill={`url(#color${category})`} 
            />
          ))}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
