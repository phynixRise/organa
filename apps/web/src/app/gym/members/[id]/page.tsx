'use client';

import { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Edit3,
  Phone,
  MessageCircle,
  Mail,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  QrCode,
  Snowflake,
  Play,
  Save,
  CheckCircle2,
  AlertCircle,
  User,
  CalendarCheck,
  DollarSign,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import {
  getMemberById,
  getMemberSubscriptions,
  getPayments,
  getAttendance,
  updateMember,
  freezeSubscription,
  reactivateSubscription,
  formatTND,
  formatDate,
  formatPhone,
  formatDateTime,
  getDaysRemaining,
  generateWhatsAppLink,
} from '@/lib/gym/dataService';
import type { Member, MemberSubscription, Payment, Attendance } from '@/lib/gym/types';

type TabId = 'overview' | 'subscriptions' | 'payments' | 'attendance' | 'notes';

const tabs = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: DollarSign },
  { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { id: 'notes', label: 'Notes', icon: FileText },
];

const statusStyles: Record<string, string> = {
  ACTIVE: 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20',
  EXPIRED: 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20',
  FROZEN: 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20',
  INACTIVE: 'bg-[#0A0A0F] text-[#6B7280] border-white/10',
};

export default function MemberDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  const { data: member, isLoading: memberLoading } = useQuery({
    queryKey: ['gym-member', id],
    queryFn: () => getMemberById(id),
  });

  const { data: subscriptions = [], isLoading: subsLoading } = useQuery({
    queryKey: ['gym-member-subs', id],
    queryFn: () => getMemberSubscriptions(id),
  });

  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ['gym-member-payments', id],
    queryFn: () => getPayments({ page: 1, pageSize: 50, memberId: id }).then((r) => r.payments),
  });

  const { data: attendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['gym-member-attendance', id],
    queryFn: () => getAttendance({ memberId: id, pageSize: 50 }),
  });

  useEffect(() => {
    if (member?.notes) setNotes(member.notes);
  }, [member]);

  const saveNotesMutation = useMutation({
    mutationFn: () => updateMember(id, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-member', id] });
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    },
  });

  const freezeMutation = useMutation({
    mutationFn: (subscriptionId: string) => freezeSubscription(subscriptionId, 30, 'Frozen by admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-member-subs', id] });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: (subscriptionId: string) => reactivateSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-member-subs', id] });
    },
  });

  const activeSubscription = subscriptions.find((s) => s.status === 'ACTIVE');
  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);

  const generateHeatmapData = useCallback(() => {
    const months = 12;
    const data: { date: string; count: number }[] = [];
    const now = new Date();
    for (let m = months - 1; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 1);
      const monthStr = monthDate.toISOString().slice(0, 7);
      const count = attendance.filter((a) => a.checkedAt.startsWith(monthStr)).length;
      data.push({ date: monthStr, count });
    }
    return data;
  }, [attendance]);

  const heatmapData = generateHeatmapData();

  if (memberLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-[#F8F8F2]/20 mx-auto mb-4" />
        <p className="text-[#6B7280]">Member not found</p>
        <Link href="/gym/members" className="text-[#F97316] text-sm mt-2 inline-block">Back to Members</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-lg text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1C1C27] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-display text-[#F8F8F2]">{member.firstName} {member.lastName}</h1>
          <p className="text-sm text-[#6B7280]">{formatPhone(member.phone)}</p>
        </div>
        <div className="flex items-center gap-2">
          {member.phone && (
            <a
              href={generateWhatsAppLink(member.phone, `Bonjour ${member.firstName},`)}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg text-[#6B7280] hover:text-[#22C55E] hover:bg-[#22C55E]/10 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone.startsWith('+') ? member.phone : `+216${member.phone}`}`}
              className="p-2 rounded-lg text-[#6B7280] hover:text-[#3B82F6] hover:bg-[#3B82F6]/10 transition-colors"
            >
              <Phone className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-[#111118] rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabId)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-[#F97316]/10 text-[#F97316]'
                : 'text-[#6B7280] hover:text-[#9CA3AF] hover:bg-[#1C1C27]'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-[#111118] border-white/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#6B7280]">Status</p>
                    <span className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[member.status] || statusStyles.INACTIVE}`}>
                      {member.status}
                    </span>
                  </CardContent>
                </Card>
                <Card className="bg-[#111118] border-white/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#6B7280]">Current Plan</p>
                    <p className="text-lg font-bold text-[#F8F8F2] mt-1">{member.currentPlanName || 'None'}</p>
                  </CardContent>
                </Card>
                <Card className="bg-[#111118] border-white/5">
                  <CardContent className="p-6">
                    <p className="text-sm text-[#6B7280]">Days Remaining</p>
                    <p className="text-lg font-bold text-[#F8F8F2] mt-1">
                      {member.daysRemaining !== undefined ? member.daysRemaining : '-'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-[#111118] border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">QR Code</h3>
                  <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl w-fit mx-auto">
                    <QRCode
                      value={`organa://checkin/${member.id}`}
                      size={180}
                      bgColor="white"
                      fgColor="#0A0A0F"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-xs text-[#6B7280] text-center mt-3">Scan for quick check-in</p>
                </CardContent>
              </Card>

              <Card className="bg-[#111118] border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Member Info</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-[#6B7280]">Email</p>
                      <p className="text-sm text-[#F8F8F2]">{member.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Phone</p>
                      <p className="text-sm text-[#F8F8F2]">{formatPhone(member.phone)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Joined</p>
                      <p className="text-sm text-[#F8F8F2]">{formatDate(member.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Last Check-in</p>
                      <p className="text-sm text-[#F8F8F2]">{member.lastCheckInAt ? formatDateTime(member.lastCheckInAt) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Total Spent</p>
                      <p className="text-sm text-[#F8F8F2]">{formatTND(totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#6B7280]">Total Payments</p>
                      <p className="text-sm text-[#F8F8F2]">{payments.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="space-y-4">
              {subsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Card key={i} className="bg-[#111118] border-white/5">
                      <CardContent className="p-6"><div className="h-20 bg-[#0A0A0F] rounded animate-pulse" /></CardContent>
                    </Card>
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <Card className="bg-[#111118] border-white/5">
                  <CardContent className="p-8 text-center">
                    <CreditCard className="w-10 h-10 text-[#F8F8F2]/20 mx-auto mb-3" />
                    <p className="text-sm text-[#6B7280]">No subscriptions yet</p>
                  </CardContent>
                </Card>
              ) : (
                subscriptions.map((sub) => (
                  <Card key={sub.id} className="bg-[#111118] border-white/5">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-[#F8F8F2]">{sub.plan?.name || 'Unknown Plan'}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium border ${statusStyles[sub.status]}`}>
                              {sub.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#6B7280] mt-1">
                            {formatDate(sub.startDate)} → {formatDate(sub.endDate)}
                          </p>
                          {sub.status === 'ACTIVE' && (
                            <p className="text-xs text-[#6B7280] mt-1">
                              {getDaysRemaining(sub.endDate)} days remaining
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {sub.status === 'ACTIVE' && (
                            <button
                              onClick={() => freezeMutation.mutate(sub.id)}
                              disabled={freezeMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B82F6]/10 text-[#3B82F6] text-xs font-medium hover:bg-[#3B82F6]/20 transition-colors"
                            >
                              <Snowflake className="w-3.5 h-3.5" />
                              Freeze
                            </button>
                          )}
                          {sub.status === 'FROZEN' && (
                            <button
                              onClick={() => reactivateMutation.mutate(sub.id)}
                              disabled={reactivateMutation.isPending}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#22C55E]/10 text-[#22C55E] text-xs font-medium hover:bg-[#22C55E]/20 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5" />
                              Reactivate
                            </button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === 'payments' && (
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Date</th>
                        <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Amount</th>
                        <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Method</th>
                        <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentsLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i} className="border-b border-white/5">
                            {Array.from({ length: 4 }).map((_, j) => (
                              <td key={j} className="p-4"><div className="h-4 w-20 bg-[#0A0A0F] rounded animate-pulse" /></td>
                            ))}
                          </tr>
                        ))
                      ) : payments.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-[#6B7280]">No payments</td></tr>
                      ) : (
                        payments.map((p) => (
                          <tr key={p.id} className="border-b border-white/5">
                            <td className="p-4 text-sm text-[#9CA3AF]">{formatDateTime(p.paidAt)}</td>
                            <td className="p-4 text-sm font-medium text-[#F8F8F2]">{formatTND(p.amount)}</td>
                            <td className="p-4 text-sm text-[#9CA3AF]">{p.method}</td>
                            <td className="p-4 text-sm text-[#6B7280] font-mono">{p.receiptNumber}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-4">
              <Card className="bg-[#111118] border-white/5">
                <CardContent className="p-6">
                  <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Attendance Heatmap (12 months)</h3>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {heatmapData.map((month) => (
                      <div key={month.date} className="flex flex-col items-center gap-1 min-w-[60px]">
                        <div
                          className={`w-full h-12 rounded-lg ${
                            month.count === 0
                              ? 'bg-[#0A0A0F]'
                              : month.count <= 2
                              ? 'bg-[#22C55E]/20'
                              : month.count <= 5
                              ? 'bg-[#22C55E]/40'
                              : 'bg-[#22C55E]/70'
                          }`}
                          title={`${month.count} check-ins`}
                        />
                        <span className="text-[10px] text-[#6B7280]">{month.date.slice(5)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#111118] border-white/5">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Date</th>
                          <th className="text-left p-4 text-xs font-medium text-[#6B7280] uppercase">Method</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceLoading ? (
                          Array.from({ length: 3 }).map((_, i) => (
                            <tr key={i} className="border-b border-white/5">
                              <td className="p-4"><div className="h-4 w-24 bg-[#0A0A0F] rounded animate-pulse" /></td>
                              <td className="p-4"><div className="h-4 w-16 bg-[#0A0A0F] rounded animate-pulse" /></td>
                            </tr>
                          ))
                        ) : attendance.length === 0 ? (
                          <tr><td colSpan={2} className="p-8 text-center text-[#6B7280]">No attendance records</td></tr>
                        ) : (
                          attendance.map((a) => (
                            <tr key={a.id} className="border-b border-white/5">
                              <td className="p-4 text-sm text-[#9CA3AF]">{formatDateTime(a.checkedAt)}</td>
                              <td className="p-4 text-sm text-[#9CA3AF]">{a.method === 'QR_CODE' ? 'QR Code' : 'Manual'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'notes' && (
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Notes</h3>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this member..."
                  rows={8}
                  className="w-full px-4 py-3 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none resize-none"
                />
                <div className="flex items-center justify-between mt-4">
                  <AnimatePresence>
                    {notesSaved && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2 text-[#22C55E] text-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Notes saved
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={() => saveNotesMutation.mutate()}
                    disabled={saveNotesMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#F97316] text-[#F8F8F2] text-sm font-medium hover:bg-[#EA580C] disabled:opacity-50 transition-colors ml-auto"
                  >
                    <Save className="w-4 h-4" />
                    {saveNotesMutation.isPending ? 'Saving...' : 'Save Notes'}
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
