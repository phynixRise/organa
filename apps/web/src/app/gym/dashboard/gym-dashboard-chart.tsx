'use client';

import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getRevenueChart } from '@/lib/gym/dataService';

export default function GymDashboardChart() {
  const { data: revenueData = [], isLoading } = useQuery({
    queryKey: ['gym-revenue'],
    queryFn: getRevenueChart,
  });

  return (
    <div className="bg-[#1a1a24] border border-white/5 rounded-2xl p-5">
      <h3 className="text-sm font-medium text-white/60 mb-4">Revenue (12 months)</h3>
      <div className="h-64">
        {isLoading ? (
          <div className="h-full bg-white/5 rounded-xl animate-pulse" />
        ) : revenueData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-white/30 text-sm">
            No revenue data
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  background: '#1a1a24',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '13px',
                }}
                formatter={(value) => [`${(Number(value) / 1000).toFixed(3)} TND`, 'Revenue']}
              />
              <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                {revenueData.map((_, index) => (
                  <Cell
                    key={index}
                    fill="#F97316"
                    fillOpacity={index === revenueData.length - 1 ? 1 : 0.5}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
