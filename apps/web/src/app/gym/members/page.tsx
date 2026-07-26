'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  MessageCircle,
  MoreVertical,
  Plus,
  Search,
  User,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMembers, formatDate, formatDateTime, formatPhone, generateWhatsAppLink, downloadCsv, escapeCsvValue } from '@/lib/gym/dataService';
import type { Member, MemberFilters, MemberStatus } from '@/lib/gym/types';

const statusFilterOptions: Array<{ value: MemberFilters['status']; label: string }> = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'EXPIRED', label: 'Expired' },
  { value: 'FROZEN', label: 'Frozen' },
  { value: 'INACTIVE', label: 'Inactive' },
];

function StatusBadge({ status }: { status: Member['status'] }) {
  const config = {
    ACTIVE: { color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', dot: '#22C55E', label: 'Active' },
    EXPIRED: { color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', dot: '#EF4444', label: 'Expired' },
    FROZEN: { color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', dot: '#3B82F6', label: 'Frozen' },
    INACTIVE: { color: 'text-[#6B7280]', bg: 'bg-[#6B7280]/10', dot: '#6B7280', label: 'Inactive' },
  };
  const current = config[status] || config.INACTIVE;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${current.bg} ${current.color}`}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: current.dot }} />
      {current.label}
    </span>
  );
}

function getDaysRemainingLabel(member: Member) {
  if (member.daysRemaining === undefined || member.daysRemaining === null) return 'No plan';
  if (member.daysRemaining < 0) return `Expired ${Math.abs(member.daysRemaining)}d ago`;
  if (member.daysRemaining === 0) return 'Expires today';
  return `${member.daysRemaining}d remaining`;
}

function getDaysRemainingTone(member: Member) {
  if (member.daysRemaining === undefined || member.daysRemaining === null) return 'text-[#6B7280]';
  if (member.daysRemaining < 0) return 'text-[#EF4444]';
  if (member.daysRemaining <= 7) return 'text-[#EAB308]';
  return 'text-[#22C55E]';
}

export default function MembersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MemberFilters>({
    page: 1,
    pageSize: 25,
    status: 'ALL',
  });
  const [searchValue, setSearchValue] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const membersQuery = useQuery({
    queryKey: ['members', filters],
    queryFn: async () => {
      const response = await getMembers(filters);
      return {
        members: response.data || [],
        totalPages: response.meta?.totalPages || 1,
        total: response.meta?.total || 0,
      };
    },
  });

  const members = membersQuery.data?.members ?? [];
  const totalPages = membersQuery.data?.totalPages || 1;
  const totalMembers = membersQuery.data?.total || 0;
  const loading = membersQuery.isLoading;

  const selectedMembers = useMemo(
    () => members.filter((m) => selectedIds.includes(m.id)),
    [members, selectedIds],
  );

  const allCurrentPageSelected = members.length > 0 && selectedMembers.length === members.length;

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchValue.trim() || undefined, page: 1 }));
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  useEffect(() => {
    setSelectedIds((current) => current.filter((id) => members.some((m) => m.id === id)));
  }, [members]);

  const handleToggleMember = useCallback((memberId: string, checked: boolean) => {
    setSelectedIds((current) => checked ? [...current, memberId] : current.filter((id) => id !== memberId));
  }, []);

  const handleToggleAllCurrentPage = useCallback((checked: boolean) => {
    setSelectedIds(checked ? members.map((m) => m.id) : []);
  }, [members]);

  const handleExportSelection = useCallback(() => {
    if (selectedMembers.length === 0) return;
    const headers = ['id', 'firstName', 'lastName', 'phone', 'plan', 'expiry', 'status', 'lastCheckIn', 'notes'];
    const rows = selectedMembers.map((m) => [
      m.id, m.firstName, m.lastName, m.phone, m.currentPlanName ?? '',
      m.expiryDate ? formatDate(m.expiryDate) : '', m.status,
      m.lastCheckInAt ? formatDateTime(m.lastCheckInAt) : '', m.notes ?? '',
    ].map(escapeCsvValue).join(','));
    downloadCsv(`members-${new Date().toISOString().slice(0, 10)}.csv`, [headers.join(','), ...rows].join('\n'));
  }, [selectedMembers]);

  const openMemberReminder = useCallback((member: Member) => {
    if (!member.phone) return;
    window.open(generateWhatsAppLink(member.phone, `Bonjour ${member.firstName},`), '_blank');
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search by name or phone..."
            className="h-11 w-full rounded-lg border border-white/5 bg-[#111118] pl-10 pr-4 text-sm text-[#F8F8F2] placeholder:text-[#6B7280] transition-colors focus:border-[#F97316]/30 focus:outline-none"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterOpen((c) => !c)}
            className={`flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
              filterOpen
                ? 'border-[#F97316]/30 bg-[#F97316]/10 text-[#F97316]'
                : 'border-white/5 bg-[#111118] text-[#9CA3AF] hover:bg-[#1C1C27]'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </button>

          <Link
            href="/gym/members/new"
            className="flex h-11 items-center gap-2 rounded-lg bg-[#F97316] px-4 text-sm font-medium text-white transition-colors hover:bg-[#C0560E]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add</span>
          </Link>
        </div>
      </div>

      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-white/5 bg-[#111118] p-4"
          >
            <div className="flex flex-wrap gap-2">
              {statusFilterOptions.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setFilters((prev) => ({ ...prev, status: s.value, page: 1 }))}
                  className={`h-8 rounded-lg px-3 text-xs font-medium transition-colors ${
                    filters.status === s.value
                      ? 'bg-[#F97316] text-white'
                      : 'border border-white/5 bg-[#0A0A0F] text-[#9CA3AF] hover:bg-[#1C1C27]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedMembers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-xl border border-[#F97316]/20 bg-[#F97316]/10 p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-medium text-[#F8F8F2]">{selectedMembers.length} member(s) selected</p>
                <p className="text-xs text-[#FDBA74]">Quick actions on current page.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => selectedMembers.forEach((m, i) => setTimeout(() => openMemberReminder(m), i * 250))}
                  className="flex h-9 items-center gap-2 rounded-lg bg-[#22C55E] px-3 text-xs font-medium text-white transition-colors hover:bg-[#16a34a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Reminders
                </button>
                <button
                  onClick={handleExportSelection}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#111118] px-3 text-xs font-medium text-[#F8F8F2] transition-colors hover:bg-[#1C1C27]"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => setSelectedIds([])}
                  className="h-9 rounded-lg px-3 text-xs font-medium text-[#FDE68A] transition-colors hover:bg-white/5"
                >
                  Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="hidden overflow-hidden rounded-xl border border-white/5 bg-[#111118] shadow-xl md:block">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-[#1C1C27] animate-pulse" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto mb-3 h-12 w-12 text-[#6B7280]" />
            <p className="text-[#9CA3AF]">No members found</p>
            <p className="mt-1 text-sm text-[#6B7280]">Adjust filters or add a new member.</p>
          </div>
        ) : (
          <>
            <div className="border-b border-white/5 px-4 py-3">
              <p className="text-sm text-[#9CA3AF]">{totalMembers} member(s) in this view</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={allCurrentPageSelected}
                        onChange={(e) => handleToggleAllCurrentPage(e.target.checked)}
                        className="h-4 w-4 rounded border-white/10 bg-[#0A0A0F] text-[#F97316] focus:ring-[#F97316]/50"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Member</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Plan</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Expiry</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-[#9CA3AF]">Last check-in</th>
                    <th className="w-12 px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {members.map((member, index) => (
                    <motion.tr
                      key={member.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => router.push(`/gym/members/${member.id}`)}
                      className="cursor-pointer border-b border-white/5 transition-colors hover:bg-[#1C1C27]"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(member.id)}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleToggleMember(member.id, e.target.checked)}
                          className="h-4 w-4 rounded border-white/10 bg-[#0A0A0F] text-[#F97316] focus:ring-[#F97316]/50"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#F8F8F2]">{member.firstName} {member.lastName}</p>
                            <p className="text-xs text-[#6B7280]">Joined {formatDate(member.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm text-[#9CA3AF]">{formatPhone(member.phone)}</td>
                      <td className="px-4 py-3 text-sm text-[#F8F8F2]">{member.currentPlanName ?? 'No plan'}</td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm text-[#F8F8F2]">{member.expiryDate ? formatDate(member.expiryDate) : '-'}</p>
                          <p className={`text-xs font-medium ${getDaysRemainingTone(member)}`}>
                            {getDaysRemainingLabel(member)}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={member.status} />
                      </td>
                      <td className="px-4 py-3 text-sm text-[#9CA3AF]">
                        {member.lastCheckInAt ? formatDateTime(member.lastCheckInAt) : 'Never'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); openMemberReminder(member); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#0A0A0F] hover:text-[#22C55E]"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/gym/members/${member.id}`); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6B7280] transition-colors hover:bg-[#0A0A0F] hover:text-[#F8F8F2]"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-white/5 px-4 py-3">
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                  disabled={filters.page === 1}
                  className="flex items-center gap-1 text-sm text-[#9CA3AF] transition-colors hover:text-[#F8F8F2] disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                <span className="text-sm text-[#6B7280]">Page {filters.page} / {totalPages}</span>
                <button
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
                  disabled={filters.page === totalPages}
                  className="flex items-center gap-1 text-sm text-[#9CA3AF] transition-colors hover:text-[#F8F8F2] disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-3 md:hidden">
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-36 rounded-xl bg-[#111118] animate-pulse" />)
        ) : members.length === 0 ? (
          <div className="rounded-xl border border-white/5 bg-[#111118] p-8 text-center">
            <User className="mx-auto mb-3 h-12 w-12 text-[#6B7280]" />
            <p className="text-[#9CA3AF]">No members found</p>
          </div>
        ) : (
          members.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => router.push(`/gym/members/${member.id}`)}
              className="rounded-xl border border-white/5 bg-[#111118] p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {member.firstName?.charAt(0)}{member.lastName?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-medium text-[#F8F8F2]">{member.firstName} {member.lastName}</h3>
                      <p className="font-mono text-xs text-[#9CA3AF]">{formatPhone(member.phone)}</p>
                    </div>
                    <StatusBadge status={member.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[#6B7280]">Plan</p>
                      <p className="mt-1 text-[#F8F8F2]">{member.currentPlanName ?? 'None'}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Expiry</p>
                      <p className="mt-1 text-[#F8F8F2]">{member.expiryDate ? formatDate(member.expiryDate) : '-'}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Remaining</p>
                      <p className={`mt-1 font-medium ${getDaysRemainingTone(member)}`}>{getDaysRemainingLabel(member)}</p>
                    </div>
                    <div>
                      <p className="text-[#6B7280]">Last check-in</p>
                      <p className="mt-1 text-[#F8F8F2]">{member.lastCheckInAt ? formatDate(member.lastCheckInAt) : 'Never'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); openMemberReminder(member); }}
                      className="flex h-8 items-center gap-1 rounded-lg bg-[#22C55E]/10 px-3 text-xs font-medium text-[#22C55E]"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); router.push(`/gym/members/${member.id}`); }}
                      className="flex h-8 items-center gap-1 rounded-lg border border-white/5 px-3 text-xs font-medium text-[#F8F8F2]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-xl border border-white/5 bg-[#111118] px-4 py-3 md:hidden">
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
            disabled={filters.page === 1}
            className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Previous
          </button>
          <span className="text-sm text-[#6B7280]">Page {filters.page} / {totalPages}</span>
          <button
            onClick={() => setFilters((prev) => ({ ...prev, page: Math.min(totalPages, (prev.page || 1) + 1) }))}
            disabled={filters.page === totalPages}
            className="flex items-center gap-1 text-sm text-[#9CA3AF] hover:text-[#F8F8F2] disabled:opacity-30"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
