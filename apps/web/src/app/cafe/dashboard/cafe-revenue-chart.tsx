'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface CafeChartProps {
  data: { month: string; revenue: number }[];
}

export default function CafeRevenueChart({ data }: CafeChartProps) {
  return (
    <div className="card-cafe">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        <h2 className="font-display text-lg font-bold text-stone-800 dark:text-stone-100">Revenus mensuels</h2>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#A8A29E', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #E8DDD4', borderRadius: '12px', color: '#292524' }} />
            <Bar dataKey="revenue" fill="#D97706" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
