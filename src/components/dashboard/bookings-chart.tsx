'use client';

import React from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface BookingsChartProps {
  data: any[];
}

export default function BookingsChart({ data }: BookingsChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f3" />
        <XAxis dataKey="name" stroke="#64746b" fontSize={10} tickLine={false} />
        <YAxis stroke="#64746b" fontSize={10} tickLine={false} />
        <Tooltip 
          contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8e5', fontSize: '11px' }}
          formatter={(value: any) => [value, 'Bookings']}
        />
        <Bar dataKey="bookings" fill="#198754" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
