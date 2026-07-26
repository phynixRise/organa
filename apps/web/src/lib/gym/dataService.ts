import { api } from '@/lib/api';
import type {
  Member, SubscriptionPlan, Payment, Attendance,
  MemberFilters, PaymentFilters, DashboardStats, ActivityEvent,
  ExpiringAlert, RevenueData, NotificationTemplate,
} from './types';

function getOrgId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('orgId');
}

function orgPath(sub: string): string {
  const orgId = getOrgId();
  return `/organizations/${orgId}/${sub}`;
}

function formatTND(amount: number): string {
  return `${(amount / 1000).toFixed(3)} TND`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString('fr-FR');
}

function formatPhone(phone: string): string {
  if (!phone) return '';
  if (phone.startsWith('+216')) return phone;
  return `+216${phone}`;
}

function getDaysRemaining(endDate: string): number {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function generateWhatsAppLink(phone: string, message: string): string {
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned.startsWith('216') ? cleaned : `216${cleaned}`}?text=${encodeURIComponent(message)}`;
}

function buildExpiryMessage(firstName: string, gymName: string, expiryDate: string, templates?: NotificationTemplate[]): string {
  const template = templates?.find((t) => t.type === 'expiry_reminder');
  if (template) {
    return template.fr
      .replace('{name}', firstName)
      .replace('{gym}', gymName)
      .replace('{date}', expiryDate);
  }
  return `Bonjour ${firstName}, votre abonnement au ${gymName} expire le ${expiryDate}. Merci de le renouveler.`;
}

function escapeCsvValue(value: string): string {
  const normalized = value.replace(/"/g, '""');
  return /[",\n]/.test(normalized) ? `"${normalized}"` : normalized;
}

function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface MemberSubscription {
  id: string;
  memberId: string;
  planId: string;
  plan?: SubscriptionPlan;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'FROZEN';
  notes?: string;
}

async function getMembers(filters: MemberFilters) {
  try {
    const memberships = await api.get<any[]>(orgPath('gym-memberships'));
    const now = new Date();
    let members: Member[] = memberships.map((m: any) => {
      const endDate = m.endDate ? new Date(m.endDate) : null;
      const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
      let status: Member['status'] = 'INACTIVE';
      if (endDate) {
        if (daysRemaining !== undefined && daysRemaining < 0) status = 'EXPIRED';
        else if (daysRemaining !== undefined && daysRemaining >= 0) status = 'ACTIVE';
      }
      const nameParts = (m.customer?.name || '').split(' ');
      return {
        id: m.customerId || m.customer?.id || m.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: m.customer?.phone || '',
        email: m.customer?.email || '',
        status,
        currentPlanName: m.planName || '',
        expiryDate: m.endDate || '',
        daysRemaining,
        gymId: m.orgId,
        createdAt: m.startDate || m.customer?.createdAt || '',
        notes: '',
      };
    });

    if (filters.status && filters.status !== 'ALL') {
      members = members.filter((m) => m.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      members = members.filter((m) =>
        `${m.firstName} ${m.lastName}`.toLowerCase().includes(q) ||
        (m.phone || '').includes(q)
      );
    }

    const total = members.length;
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
    const page = filters.page || 1;
    const start = (page - 1) * filters.pageSize;
    members = members.slice(start, start + filters.pageSize);

    return { data: members, meta: { total, totalPages } };
  } catch {
    return { data: [] as Member[], meta: { total: 0, totalPages: 1 } };
  }
}

async function getMemberById(id: string): Promise<Member | null> {
  try {
    const memberships = await api.get<any[]>(orgPath('gym-memberships'));
    const m = memberships.find((m: any) => m.customerId === id || m.customer?.id === id);
    if (!m) {
      const customer = await api.get<any>(`${orgPath(`customers/${id}`)}`);
      if (!customer) return null;
      const nameParts = (customer.name || '').split(' ');
      return {
        id: customer.id,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        phone: customer.phone || '',
        email: customer.email || '',
        status: 'INACTIVE',
        gymId: customer.orgId,
        createdAt: customer.createdAt,
      };
    }
    const now = new Date();
    const endDate = m.endDate ? new Date(m.endDate) : null;
    const daysRemaining = endDate ? Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : undefined;
    let status: Member['status'] = 'INACTIVE';
    if (endDate) {
      if (daysRemaining !== undefined && daysRemaining < 0) status = 'EXPIRED';
      else if (daysRemaining !== undefined && daysRemaining >= 0) status = 'ACTIVE';
    }
    const nameParts = (m.customer?.name || '').split(' ');
    return {
      id: m.customerId || m.customer?.id || m.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      phone: m.customer?.phone || '',
      email: m.customer?.email || '',
      status,
      currentPlanName: m.planName || '',
      expiryDate: m.endDate || '',
      daysRemaining,
      gymId: m.orgId,
      createdAt: m.startDate || m.customer?.createdAt || '',
      notes: '',
    };
  } catch {
    return null;
  }
}

async function getPlans(): Promise<SubscriptionPlan[]> {
  try {
    return await api.get<SubscriptionPlan[]>(orgPath('gym-plans'));
  } catch {
    return [];
  }
}

async function createPlan(data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
  try {
    return await api.post<SubscriptionPlan>(orgPath('gym-plans'), data);
  } catch {
    return null;
  }
}

async function updatePlan(id: string, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | null> {
  try {
    return await api.put<SubscriptionPlan>(orgPath(`gym-plans/${id}`), data);
  } catch {
    return null;
  }
}

async function deletePlan(id: string): Promise<boolean> {
  try {
    await api.delete(orgPath(`gym-plans/${id}`));
    return true;
  } catch {
    return false;
  }
}

async function updateMember(id: string, data: Partial<Member>): Promise<Member | null> {
  try {
    return await api.put<Member>(orgPath(`customers/${id}`), data);
  } catch {
    return null;
  }
}

async function getPayments(filters: PaymentFilters): Promise<{ payments: Payment[]; total: number; totalPages: number }> {
  const params = new URLSearchParams();
  params.set('page', String(filters.page));
  params.set('pageSize', String(filters.pageSize));
  if (filters.method && filters.method !== 'ALL') params.set('method', filters.method);
  if (filters.memberId) params.set('memberId', filters.memberId);
  if (filters.memberSearch) params.set('memberSearch', filters.memberSearch);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);

  try {
    const response = await api.get<{ data: Payment[]; meta: { total: number; totalPages: number } }>(
      `${orgPath('gym-payments')}?${params.toString()}`
    );
    return { payments: response.data ?? [], total: response.meta?.total ?? 0, totalPages: response.meta?.totalPages ?? 1 };
  } catch {
    return { payments: [], total: 0, totalPages: 1 };
  }
}

async function getPaymentSummary(): Promise<{ today: number; week: number; month: number }> {
  try {
    return await api.get<{ today: number; week: number; month: number }>(orgPath('gym-payments/summary'));
  } catch {
    return { today: 0, week: 0, month: 0 };
  }
}

async function recordPayment(data: { memberId: string; amount: number; method: string; notes?: string }): Promise<Payment | null> {
  try {
    return await api.post<Payment>(orgPath('gym-payments'), data);
  } catch {
    return null;
  }
}

async function getAttendance(filters: { date?: string; memberId?: string; pageSize?: number }): Promise<Attendance[]> {
  const params = new URLSearchParams();
  if (filters.date) params.set('date', filters.date);
  if (filters.memberId) params.set('memberId', filters.memberId);
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize));

  try {
    return await api.get<Attendance[]>(`${orgPath('gym-attendance')}?${params.toString()}`);
  } catch {
    return [];
  }
}

async function checkInMember(memberId: string, gymId: string, method: string, userId: string): Promise<Attendance | null> {
  try {
    return await api.post<Attendance>(orgPath('gym-attendance'), { memberId, gymId, method, userId });
  } catch {
    return null;
  }
}

async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await api.get<DashboardStats>(orgPath('gym-dashboard/stats'));
  } catch {
    return { activeMembers: 0, activeMembersDelta: 0, monthlyRevenue: 0, monthlyRevenueDelta: 0, expiringSoon: 0, checkinsToday: 0 };
  }
}

async function getActivityFeed(): Promise<ActivityEvent[]> {
  try {
    return await api.get<ActivityEvent[]>(orgPath('gym-dashboard/activity'));
  } catch {
    return [];
  }
}

async function getExpiringAlerts(): Promise<ExpiringAlert[]> {
  try {
    return await api.get<ExpiringAlert[]>(orgPath('gym-dashboard/alerts'));
  } catch {
    return [];
  }
}

async function getRevenueChart(): Promise<RevenueData[]> {
  try {
    return await api.get<RevenueData[]>(orgPath('gym-dashboard/revenue'));
  } catch {
    return [];
  }
}

async function getMemberSubscriptions(memberId: string): Promise<MemberSubscription[]> {
  try {
    return await api.get<MemberSubscription[]>(orgPath(`customers/${memberId}/subscriptions`));
  } catch {
    return [];
  }
}

async function freezeSubscription(subscriptionId: string, days: number, reason: string): Promise<boolean> {
  try {
    await api.post(orgPath(`gym-subscriptions/${subscriptionId}/freeze`), { days, reason });
    return true;
  } catch {
    return false;
  }
}

async function reactivateSubscription(subscriptionId: string): Promise<boolean> {
  try {
    await api.post(orgPath(`gym-subscriptions/${subscriptionId}/reactivate`));
    return true;
  } catch {
    return false;
  }
}

async function createSubscription(memberId: string, data: { planId: string; startDate?: string }): Promise<boolean> {
  try {
    await api.post(orgPath(`customers/${memberId}/subscriptions`), data);
    return true;
  } catch {
    return false;
  }
}

async function getOrganization(): Promise<{ id: string; name: string; businessType: string; notificationTemplates?: NotificationTemplate[] }> {
  const orgId = getOrgId();
  if (!orgId) return { id: '', name: 'GymFlow', businessType: 'gym' };
  try {
    return await api.get<{ id: string; name: string; businessType: string; notificationTemplates?: NotificationTemplate[] }>(
      `/organizations/${orgId}`
    );
  } catch {
    return { id: orgId || '', name: 'GymFlow', businessType: 'gym' };
  }
}

async function updateOrganization(data: { name?: string; notificationTemplates?: NotificationTemplate[] }): Promise<boolean> {
  const orgId = getOrgId();
  if (!orgId) return false;
  try {
    await api.put(`/organizations/${orgId}`, data);
    return true;
  } catch {
    return false;
  }
}

export {
  formatTND,
  formatDate,
  formatDateTime,
  formatPhone,
  getDaysRemaining,
  generateWhatsAppLink,
  buildExpiryMessage,
  escapeCsvValue,
  downloadCsv,
  getMembers,
  getMemberById,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  updateMember,
  getPayments,
  getPaymentSummary,
  recordPayment,
  getAttendance,
  checkInMember,
  getDashboardStats,
  getActivityFeed,
  getExpiringAlerts,
  getRevenueChart,
  getMemberSubscriptions,
  freezeSubscription,
  reactivateSubscription,
  createSubscription,
  getOrganization as getGym,
  updateOrganization as updateGym,
};
