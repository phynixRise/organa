'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  CalendarCheck,
  Clock,
  UserCheck,
  ScanLine,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { useOrganization } from '@/contexts/organization-context';
import {
  getMembers,
  getAttendance,
  checkInMember,
  formatDateTime,
} from '@/lib/gym/dataService';
import type { Member, Attendance } from '@/lib/gym/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export default function AttendancePage() {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [checkInResult, setCheckInResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const today = new Date().toISOString().split('T')[0];

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['gym-members'],
    queryFn: async () => {
      const result = await getMembers({ page: 1, pageSize: 200, status: 'ACTIVE' });
      return result.data || [];
    },
  });

  const { data: todayAttendance = [], isLoading: attendanceLoading } = useQuery({
    queryKey: ['gym-attendance', today],
    queryFn: () => getAttendance({ date: today, pageSize: 100 }),
  });

  const checkInMutation = useMutation({
    mutationFn: async (memberId: string) => {
      return checkInMember(memberId, organization?.id || '', 'MANUAL', user?.id || '');
    },
    onSuccess: (result) => {
      if (result) {
        setCheckInResult({ type: 'success', message: 'Check-in recorded successfully' });
        queryClient.invalidateQueries({ queryKey: ['gym-attendance', today] });
        setSelectedMember(null);
        setSearchQuery('');
        setTimeout(() => setCheckInResult(null), 3000);
      } else {
        setCheckInResult({ type: 'error', message: 'Failed to record check-in' });
        setTimeout(() => setCheckInResult(null), 3000);
      }
    },
    onError: () => {
      setCheckInResult({ type: 'error', message: 'An error occurred' });
      setTimeout(() => setCheckInResult(null), 3000);
    },
  });

  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return members
      .filter((m) =>
        m.firstName?.toLowerCase().includes(q) ||
        m.lastName?.toLowerCase().includes(q) ||
        m.phone?.includes(q)
      )
      .slice(0, 5);
  }, [members, searchQuery]);

  const handleCheckIn = useCallback((member: Member) => {
    setSelectedMember(member);
    checkInMutation.mutate(member.id);
  }, [checkInMutation]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display text-[#F8F8F2]">Attendance</h1>
        <p className="text-sm text-[#6B7280]">{todayAttendance.length} check-ins today</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Today's Check-ins", value: todayAttendance.length, icon: CalendarCheck, color: 'from-green-500 to-emerald-500' },
          { label: 'Active Members', value: members.length, icon: UserCheck, color: 'from-blue-500 to-cyan-500' },
          { label: 'Last Check-in', value: todayAttendance.length > 0 ? formatDateTime(todayAttendance[todayAttendance.length - 1].checkedAt) : 'None', icon: Clock, color: 'from-purple-500 to-pink-500', isText: true },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-[#111118] border-white/5">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-[#6B7280]">{item.label}</p>
                    {item.isText ? (
                      <p className="text-lg font-bold text-[#F8F8F2] mt-1">{item.value}</p>
                    ) : (
                      <h3 className="text-2xl font-bold text-[#F8F8F2] mt-1">{item.value}</h3>
                    )}
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

      <Card className="bg-[#111118] border-white/5">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Quick Check-in</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280]" />
            <input
              type="text"
              placeholder="Search member by name or phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedMember(null);
              }}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-[#0A0A0F] border border-white/5 text-[#F8F8F2] placeholder:text-[#6B7280] text-sm focus:border-[#F97316]/30 focus:outline-none transition-colors"
            />
          </div>

          {filteredMembers.length > 0 && !selectedMember && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 bg-[#252530] border border-white/10 rounded-xl overflow-hidden"
            >
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleCheckIn(member)}
                  disabled={checkInMutation.isPending}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#1C1C27] transition-colors text-left border-b border-white/5 last:border-0 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[#F8F8F2] text-sm font-bold shrink-0">
                    {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F8F8F2] truncate">{member.firstName} {member.lastName}</p>
                    <p className="text-xs text-[#6B7280]">{member.phone}</p>
                  </div>
                  {checkInMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ScanLine className="w-5 h-5 text-[#6B7280]" />
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {checkInResult && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`mt-4 flex items-center gap-3 p-4 rounded-xl ${
                checkInResult.type === 'success'
                  ? 'bg-[#22C55E]/10 border border-[#22C55E]/20'
                  : 'bg-[#EF4444]/10 border border-[#EF4444]/20'
              }`}
            >
              {checkInResult.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E] shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
              )}
              <p className={`text-sm ${checkInResult.type === 'success' ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                {checkInResult.message}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#111118] border-white/5">
        <CardContent className="p-6">
          <h3 className="text-sm font-medium text-[#9CA3AF] mb-4">Today's Attendance</h3>
          {attendanceLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0A0A0F] animate-pulse" />
                  <div className="flex-1 space-y-1">
                    <div className="h-4 w-32 bg-[#0A0A0F] rounded animate-pulse" />
                    <div className="h-3 w-24 bg-[#0A0A0F] rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : todayAttendance.length === 0 ? (
            <div className="text-center py-8">
              <CalendarCheck className="w-10 h-10 text-[#F8F8F2]/20 mx-auto mb-3" />
              <p className="text-sm text-[#6B7280]">No check-ins today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {todayAttendance.map((record, i) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-[#0A0A0F] hover:bg-white/[0.04] transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[#F8F8F2] text-sm font-bold shrink-0">
                    {record.member?.firstName?.charAt(0) || '?'}{record.member?.lastName?.charAt(0) || ''}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#F8F8F2] truncate">
                      {record.member ? `${record.member.firstName} ${record.member.lastName}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-[#6B7280]">{formatDateTime(record.checkedAt)}</p>
                  </div>
                  <span className="text-xs text-[#6B7280] px-2 py-1 rounded bg-[#0A0A0F]">
                    {record.method === 'QR_CODE' ? 'QR' : 'Manual'}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
