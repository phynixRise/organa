export type MemberStatus = 'ACTIVE' | 'EXPIRED' | 'FROZEN' | 'INACTIVE';

export type PaymentMethod = 'CASH' | 'CARD' | 'VIREMENT' | 'D17' | 'FLOUCI';

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string;
  status: MemberStatus;
  currentPlanName?: string;
  expiryDate?: string;
  daysRemaining?: number;
  lastCheckInAt?: string;
  notes?: string;
  gymId: string;
  createdAt: string;
  photoUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  nameAr?: string;
  durationDays: number;
  price: number;
  isActive: boolean;
  sortOrder: number;
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

export interface Payment {
  id: string;
  memberId: string;
  member?: Member;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  paidAt: string;
  notes?: string;
}

export interface Attendance {
  id: string;
  memberId: string;
  member?: Member;
  gymId: string;
  checkedAt: string;
  method: 'QR_CODE' | 'MANUAL';
}

export interface MemberFilters {
  page: number;
  pageSize: number;
  status: MemberStatus | 'ALL';
  plan?: string;
  expiryWindow?: 'ALL' | 'EXPIRED' | 'LE_7' | 'LE_30';
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface PaymentFilters {
  page: number;
  pageSize: number;
  method?: PaymentMethod | 'ALL';
  memberId?: string;
  memberSearch?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface NotificationTemplate {
  type: string;
  fr: string;
  ar: string;
}

export interface DashboardStats {
  activeMembers: number;
  activeMembersDelta: number;
  monthlyRevenue: number;
  monthlyRevenueDelta: number;
  expiringSoon: number;
  checkinsToday: number;
}

export interface ActivityEvent {
  id: string;
  type: 'payment' | 'checkin' | 'subscription';
  memberName: string;
  description: string;
  timestamp: string;
}

export interface ExpiringAlert {
  id: string;
  memberName: string;
  memberId: string;
  daysRemaining: number;
  endDate: string;
  urgency: 'critical' | 'high' | 'medium';
}

export interface RevenueData {
  month: string;
  revenue: number;
}
