'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import CountUp from 'react-countup';
import {
  getPayments,
  getPaymentSummary,
  formatTND,
  formatDateTime,
  downloadCsv,
  escapeCsvValue,
} from '@/lib/gym/dataService';
import type { Payment, PaymentFilters, PaymentMethod } from '@/lib/gym/types';

const methodStyles: Record<string, string> = {
  CASH: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  CARD: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
  VIREMENT: 'bg-[#8B5CF6]/10 text-[#8B5CF6] border-[#8B5CF6]/20',
  D17: 'bg-[#06B6D4]/10 text-[#06B6D4] border-[#06B6D4]/20',
  FLOUCI: 'bg-[#F97316]/10 text-[#F97316] border-[#F97316]/20',
};

const methodIcons: Record<string, typeof DollarSign> = {
  CASH: Banknote,
  CARD: CreditCard,
  VIREMENT: ArrowUpRight,
  D17: Smartphone,
  FLOUCI: Smartphone,
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [totalPayments, setTotalPayments] = useState(0);
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0 });
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');

  const [filters, setFilters] = useState<PaymentFilters>({
    page: 1,
    pageSize: 20,
    method: 'ALL',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [paymentsResult, summaryResult] = await Promise.all([
        getPayments(filters),
        getPaymentSummary(),
      ]);
      setPayments(paymentsResult.payments);
      setTotalPayments(paymentsResult.total);
      setSummary(summaryResult);
    } catch {
      setPayments([]);
      setTotalPayments(0);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = useMemo(() => Math.ceil(totalPayments / filters.pageSize), [totalPayments, filters.pageSize]);

  const handleExport = useCallback(() => {
    const headers = ['Date', 'Member', 'Amount (TND)', 'Method', 'Receipt #', 'Notes'];
    const rows = payments.map((p) => [
      formatDateTime(p.paidAt),
      p.member ? `${p.member.firstName} ${p.member.lastName}` : p.memberId,
      (p.amount / 1000).toFixed(3),
      p.method,
      p.receiptNumber,
      p.notes || '',
    ].map(escapeCsvValue).join(','));
    downloadCsv(`payments-export-${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows].join('\n'));
  }, [payments]);

  const handleMemberSearch = useCallback((value: string) => {
    setMemberSearch(value);
    setFilters((prev) => ({ ...prev, page: 1, memberSearch: value || undefined }));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-display text-[#F8F8F2]">Payments</h1>
          <p className="text-sm text-[#6B7280]">{totalPayments} total payments</p>
        </div>
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111118] border border-white/5 text-[#9CA3AF] text-sm hover:bg-[#1C1C27] transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Revenue", value: summary.today, icon: Calendar, color: 'from-green-500 to-emerald-500' },
          { label: 'This Week', value: summary.week, icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
          { label: 'This Month', value: summary.month, icon: DollarSign, color: 'from-purple-500 to-pink-500' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
          >
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">{item.label}</p>
                    <h3 className="text-2xl font-bold text-[#F8F8F2] mt-1">
                      <CountUp end={item.value / 1000} duration={2} decimals={3} separator="," />
                      <span className="text-sm font-normal text-[#6B7280] ml-1">TND</span>
                    </h3>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color}`}>
                    <item.icon className="w-5 h-5 text-[#F8F8F2]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
          <input
            type="text"
            placeholder="Search by member name..."
            value={memberSearch}
            onChange={(e) => handleMemberSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-[#111118] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#111118] border border-white/5 text-[#9CA3AF] text-sm hover:bg-[#1C1C27] transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="bg-[#111118] border-white/5">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                {(['ALL', 'CASH', 'CARD', 'VIREMENT', 'D17', 'FLOUCI'] as const).map((method) => (
                  <button
                    key={method}
                    onClick={() => setFilters((prev) => ({ ...prev, page: 1, method }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      filters.method === method
                        ? 'bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20'
                        : 'bg-[#0A0A0F] text-[#6B7280] border border-white/5 hover:bg-white/10'
                    }`}
                  >
                    {method === 'ALL' ? 'All Methods' : method}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 mt-3">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, page: 1, dateFrom: e.target.value || undefined }))}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0A0F] border border-white/10 text-[#F8F8F2] text-sm focus:border-[#F97316]/30 focus:outline-none"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters((prev) => ({ ...prev, page: 1, dateTo: e.target.value || undefined }))}
                  className="px-3 py-1.5 rounded-lg bg-[#0A0A0F] border border-white/10 text-[#F8F8F2] text-sm focus:border-[#F97316]/30 focus:outline-none"
                  placeholder="To"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="bg-[#111118] border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Date</th>
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Member</th>
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Amount</th>
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Method</th>
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Receipt #</th>
                  <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase tracking-wider">Notes</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/5">
                      {Array.from({ length: 6 }).map((_, j) => (
                        <td key={j} className="p-4"><div className="h-4 w-20 bg-[#0A0A0F] rounded animate-pulse" /></td>
                      ))}
                    </tr>
                  ))
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#6B7280]">No payments found</td>
                  </tr>
                ) : (
                  payments.map((payment) => {
                    const MethodIcon = methodIcons[payment.method] || DollarSign;
                    return (
                      <tr key={payment.id} className="border-b border-white/5 hover:bg-[#1C1C27] transition-colors">
                        <td className="p-4 text-sm text-[#9CA3AF]">{formatDateTime(payment.paidAt)}</td>
                        <td className="p-4 text-sm text-[#F8F8F2]">
                          {payment.member ? `${payment.member.firstName} ${payment.member.lastName}` : 'Unknown'}
                        </td>
                        <td className="p-4 text-sm font-medium text-[#F8F8F2]">
                          <CountUp end={payment.amount / 1000} duration={1} decimals={3} separator="," />
                          <span className="text-[#6B7280] ml-1">TND</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${methodStyles[payment.method] || methodStyles.CASH}`}>
                            <MethodIcon className="w-3 h-3" />
                            {payment.method}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-[#6B7280] font-mono">{payment.receiptNumber}</td>
                        <td className="p-4 text-sm text-[#6B7280] max-w-[200px] truncate">{payment.notes || '-'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6B7280]">
            Page {filters.page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
              disabled={filters.page <= 1}
              className="p-2 rounded-lg bg-[#111118] border border-white/5 text-[#9CA3AF] hover:bg-[#1C1C27] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
              disabled={filters.page >= totalPages}
              className="p-2 rounded-lg bg-[#111118] border border-white/5 text-[#9CA3AF] hover:bg-[#1C1C27] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
