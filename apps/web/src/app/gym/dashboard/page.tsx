'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, TrendingUp, TrendingDown, AlertTriangle, AlertCircle,
  CheckCircle, CreditCard, Activity, Clock, X,
} from 'lucide-react';
import CountUp from 'react-countup';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  getDashboardStats,
  getActivityFeed,
  getExpiringAlerts,
  getRevenueChart,
  formatDateTime,
} from '@/lib/gym/dataService';
import type { DashboardStats, ActivityEvent, ExpiringAlert, RevenueData } from '@/lib/gym/types';

function formatTND(value: number) {
  return `${(value / 1000).toFixed(3)} TND`;
}

function StatCard({
  title,
  value,
  delta,
  icon: Icon,
  color,
  suffix,
  onClick,
}: {
  title: string;
  value: number;
  delta?: number;
  icon: React.ElementType;
  color: string;
  suffix?: string;
  onClick?: () => void;
}) {
  const hasDelta = typeof delta === 'number';
  const isPositive = (delta ?? 0) >= 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className={`bg-[#111118] border border-white/5 rounded-xl p-4 lg:p-5 shadow-xl ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm text-[#9CA3AF]">{title}</p>
          <p className="font-display text-3xl lg:text-4xl text-[#F8F8F2]">
            <CountUp end={value} duration={2} separator=" " />
            {suffix && <span className="text-lg ml-1">{suffix}</span>}
          </p>
          {hasDelta && (
            <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{isPositive ? '+' : ''}{delta}</span>
              <span className="text-[#6B7280] ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function AlertBanner({ alert, onDismiss }: { alert: ExpiringAlert; onDismiss: () => void }) {
  const borderColors = {
    critical: 'border-l-[#EF4444]',
    high: 'border-l-[#F97316]',
    medium: 'border-l-[#EAB308]',
  };
  const icons = {
    critical: AlertCircle,
    high: AlertTriangle,
    medium: Clock,
  };
  const Icon = icons[alert.urgency] || Clock;

  return (
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      className={`bg-[#111118] border border-white/5 border-l-4 ${borderColors[alert.urgency]} rounded-xl p-4 flex items-center gap-3`}
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${
          alert.urgency === 'critical'
            ? 'text-[#EF4444]'
            : alert.urgency === 'high'
              ? 'text-[#F97316]'
              : 'text-[#EAB308]'
        }`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#F8F8F2]">
          <span className="font-medium">{alert.memberName}</span>
          {' '}expires in {alert.daysRemaining} day{alert.daysRemaining > 1 ? 's' : ''}
        </p>
        <p className="text-xs text-[#6B7280]">{formatDateTime(alert.endDate)}</p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6B7280] hover:bg-[#1C1C27] transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export default function GymDashboardPage() {
  const router = useRouter();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const statsQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: getDashboardStats,
  });
  const activitiesQuery = useQuery({
    queryKey: ['dashboard', 'activity'],
    queryFn: getActivityFeed,
  });
  const alertsQuery = useQuery({
    queryKey: ['dashboard', 'alerts'],
    queryFn: getExpiringAlerts,
  });
  const revenueQuery = useQuery({
    queryKey: ['dashboard', 'revenue'],
    queryFn: getRevenueChart,
  });

  const stats = statsQuery.data;
  const activities = activitiesQuery.data ?? [];
  const alerts = (alertsQuery.data ?? []).filter((a) => !dismissedAlerts.has(a.id));
  const revenueData = revenueQuery.data ?? [];
  const loading = statsQuery.isLoading || activitiesQuery.isLoading || alertsQuery.isLoading || revenueQuery.isLoading;

  const dismissAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => new Set([...prev, id]));
  }, []);

  const quickActions = [
    { icon: Users, label: 'Add member', color: 'bg-[#F97316]', onClick: () => router.push('/gym/members/new') },
    { icon: CreditCard, label: 'Payment', color: 'bg-[#3B82F6]', onClick: () => router.push('/gym/payments') },
    { icon: CheckCircle, label: 'Check-in', color: 'bg-[#22C55E]', onClick: () => router.push('/gym/attendance') },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#111118] rounded-xl p-5 h-36 animate-pulse">
              <div className="h-4 bg-[#1C1C27] rounded w-24 mb-4" />
              <div className="h-8 bg-[#1C1C27] rounded w-20 mb-3" />
              <div className="h-4 bg-[#1C1C27] rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {quickActions.map((action) => (
          <motion.button
            key={action.label}
            whileTap={{ scale: 0.97 }}
            onClick={action.onClick}
            className={`flex items-center gap-2 px-4 h-10 rounded-lg ${action.color} text-white text-sm font-medium flex-shrink-0 hover:brightness-110 transition-all`}
          >
            <action.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{action.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Active members"
          value={stats?.activeMembers || 0}
          delta={stats?.activeMembersDelta || 0}
          icon={Users}
          color="bg-[#22C55E]/20"
          onClick={() => router.push('/gym/members')}
        />
        <StatCard
          title="Monthly revenue"
          value={stats?.monthlyRevenue || 0}
          delta={stats?.monthlyRevenueDelta || 0}
          icon={CreditCard}
          color="bg-[#F97316]/20"
          suffix=" TND"
        />
        <StatCard
          title="Expiring ≤7d"
          value={stats?.expiringSoon || 0}
          icon={AlertTriangle}
          color="bg-[#EAB308]/20"
          onClick={() => router.push('/gym/members')}
        />
        <StatCard
          title="Check-ins today"
          value={stats?.checkinsToday || 0}
          icon={CheckCircle}
          color="bg-[#3B82F6]/20"
        />
      </div>

      {alerts.length > 0 && (
        <div className="space-y-2">
          <h2 className="font-display text-xl text-[#F8F8F2] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#EAB308]" />
            Expiration Alerts
          </h2>
          <AnimatePresence>
            {alerts.slice(0, 5).map((alert) => (
              <AlertBanner key={alert.id} alert={alert} onDismiss={() => dismissAlert(alert.id)} />
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-[#111118] border border-white/5 rounded-xl p-5 shadow-xl">
          <h3 className="font-display text-lg text-[#F8F8F2] mb-4">Revenue (12 months)</h3>
          <div className="h-64">
            {revenueQuery.isLoading ? (
              <div className="h-full bg-[#1C1C27] rounded animate-pulse" />
            ) : revenueData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#6B7280] text-sm">No revenue data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v} TND`} />
                  <Tooltip
                    contentStyle={{
                      background: '#22222E',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F8F8F2',
                      fontSize: '13px',
                    }}
                    formatter={(value) => [formatTND(Number(value)), 'Revenue']}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {revenueData.map((_, index) => (
                      <Cell key={index} fill="#F97316" fillOpacity={index === revenueData.length - 1 ? 1 : 0.6} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-[#111118] border border-white/5 rounded-xl p-5 shadow-xl">
          <h3 className="font-display text-lg text-[#F8F8F2] mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#F97316]" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
            {activities.length === 0 ? (
              <p className="text-sm text-[#6B7280] text-center py-8">No recent activity</p>
            ) : (
              activities.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#1C1C27] transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    event.type === 'payment' ? 'bg-[#22C55E]/20' : 'bg-[#3B82F6]/20'
                  }`}>
                    {event.type === 'payment' ? (
                      <CreditCard className="w-4 h-4 text-[#22C55E]" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-[#3B82F6]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F8F8F2] truncate">{event.memberName}</p>
                    <p className="text-xs text-[#9CA3AF]">{event.description}</p>
                    <p className="text-[11px] text-[#6B7280] mt-0.5 font-mono">
                      {formatDateTime(event.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
