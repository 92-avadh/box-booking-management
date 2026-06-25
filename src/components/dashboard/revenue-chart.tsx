'use client';

import React from 'react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  data: any[];
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0c4a28" stopOpacity={0.2}/>
            <stop offset="95%" stopColor="#0c4a28" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f3" />
        <XAxis dataKey="name" stroke="#64746b" fontSize={10} tickLine={false} />
        <YAxis stroke="#64746b" fontSize={10} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8e5', fontSize: '11px' }}
          formatter={(value: any) => [`₹${value}`, 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#0c4a28" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
