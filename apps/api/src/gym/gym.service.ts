import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GymService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(orgId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const activeMembers = await this.prisma.gymMembership.count({
      where: {
        orgId,
        endDate: { gte: now },
      },
    });

    const prevActiveMembers = await this.prisma.gymMembership.count({
      where: {
        orgId,
        startDate: { lt: lastMonth },
        endDate: { gte: lastMonth },
      },
    });

    const monthlyRevenue = await this.prisma.payment.aggregate({
      where: { orgId, createdAt: { gte: monthStart } },
      _sum: { amountMillimes: true },
    });

    const lastMonthRevenue = await this.prisma.payment.aggregate({
      where: { orgId, createdAt: { gte: lastMonth, lt: monthStart } },
      _sum: { amountMillimes: true },
    });

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const checkinsToday = await this.prisma.event.count({
      where: { orgId, type: 'check_in', createdAt: { gte: today } },
    });

    const expiringSoon = await this.prisma.gymMembership.count({
      where: {
        orgId,
        endDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const currentRevenue = monthlyRevenue._sum.amountMillimes || 0;
    const prevRevenue = lastMonthRevenue._sum.amountMillimes || 0;
    const revenueDelta = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;
    const memberDelta = prevActiveMembers > 0 ? Math.round(((activeMembers - prevActiveMembers) / prevActiveMembers) * 100) : 0;

    return {
      activeMembers,
      activeMembersDelta: memberDelta,
      monthlyRevenue: currentRevenue,
      monthlyRevenueDelta: revenueDelta,
      expiringSoon,
      checkinsToday,
    };
  }

  async getActivityFeed(orgId: string) {
    const events = await this.prisma.event.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return events.map((e) => ({
      id: e.id,
      type: e.type === 'payment' ? 'payment' : e.type === 'check_in' ? 'checkin' : 'subscription',
      memberName: (e.payload as any)?.memberName || 'Unknown',
      description: (e.payload as any)?.description || e.type,
      timestamp: e.createdAt.toISOString(),
    }));
  }

  async getExpiringAlerts(orgId: string) {
    const now = new Date();
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const memberships = await this.prisma.gymMembership.findMany({
      where: {
        orgId,
        endDate: { gte: now, lte: in30Days },
      },
      include: { customer: { select: { name: true } } },
      orderBy: { endDate: 'asc' },
      take: 10,
    });

    return memberships.map((m) => {
      const daysRemaining = Math.ceil(
        (m.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      return {
        id: m.id,
        memberName: m.customer.name,
        memberId: m.customerId,
        daysRemaining,
        endDate: m.endDate.toISOString(),
        urgency: daysRemaining <= 3 ? 'critical' : daysRemaining <= 7 ? 'high' : 'medium',
      };
    });
  }

  async getRevenueChart(orgId: string) {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleString('en', { month: 'short' });

      const result = await this.prisma.payment.aggregate({
        where: { orgId, createdAt: { gte: d, lte: monthEnd } },
        _sum: { amountMillimes: true },
      });

      months.push({ month: label, revenue: result._sum.amountMillimes || 0 });
    }
    return months;
  }

  async getGymPlans(orgId: string) {
    return this.prisma.$queryRaw`
      SELECT id, name, "durationDays", "priceMillimes" as price, "isActive", "sortOrder"
      FROM gym_plans
      WHERE "orgId" = ${orgId}::uuid
      ORDER BY "sortOrder" ASC
    `.catch(() => []);
  }

  async createGymPlan(orgId: string, data: any) {
    return this.prisma.$queryRaw`
      INSERT INTO gym_plans (id, "orgId", name, "durationDays", "priceMillimes", "isActive", "sortOrder")
      VALUES (gen_random_uuid(), ${orgId}::uuid, ${data.name}, ${data.durationDays || 30}, ${data.price || 0}, true, ${data.sortOrder || 0})
      RETURNING id, name, "durationDays", "priceMillimes" as price, "isActive", "sortOrder" as "sortOrder"
    `.then((r: any[]) => r[0]);
  }

  async updateGymPlan(orgId: string, planId: string, data: any) {
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 3;

    if (data.name !== undefined) { fields.push(`"name" = $${idx}`); values.push(data.name); idx++; }
    if (data.durationDays !== undefined) { fields.push(`"durationDays" = $${idx}`); values.push(data.durationDays); idx++; }
    if (data.price !== undefined) { fields.push(`"priceMillimes" = $${idx}`); values.push(data.price); idx++; }
    if (data.isActive !== undefined) { fields.push(`"isActive" = $${idx}`); values.push(data.isActive); idx++; }
    if (data.sortOrder !== undefined) { fields.push(`"sortOrder" = $${idx}`); values.push(data.sortOrder); idx++; }

    if (fields.length === 0) return null;
    return this.prisma.$queryRawUnsafe(
      `UPDATE gym_plans SET ${fields.join(', ')} WHERE id = $1 AND "orgId" = $2::uuid RETURNING id, name, "durationDays", "priceMillimes" as price, "isActive", "sortOrder"`,
      planId, orgId, ...values,
    ).then((r: any[]) => r[0]);
  }

  async deleteGymPlan(orgId: string, planId: string) {
    await this.prisma.$queryRawUnsafe(
      `DELETE FROM gym_plans WHERE id = $1 AND "orgId" = $2::uuid`,
      planId, orgId,
    );
  }

  async getGymPayments(orgId: string, query: any) {
    const page = parseInt(query.page) || 1;
    const pageSize = parseInt(query.pageSize) || 20;
    const skip = (page - 1) * pageSize;

    const where: any = { orgId };
    if (query.method && query.method !== 'ALL') where.method = query.method;
    if (query.customerId) where.order = { customerId: query.customerId };

    const [data, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          order: {
            include: { customer: { select: { name: true } } },
          },
        },
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: data.map((p) => ({
        id: p.id,
        memberId: p.order?.customerId || '',
        member: p.order?.customer ? { name: p.order.customer.name } : null,
        amount: p.amountMillimes,
        method: p.method || 'CASH',
        receiptNumber: p.provider || '',
        paidAt: p.createdAt.toISOString(),
        notes: '',
      })),
      meta: { total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async getPaymentSummary(orgId: string) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [todaySum, weekSum, monthSum] = await Promise.all([
      this.prisma.payment.aggregate({ where: { orgId, createdAt: { gte: today } }, _sum: { amountMillimes: true } }),
      this.prisma.payment.aggregate({ where: { orgId, createdAt: { gte: weekAgo } }, _sum: { amountMillimes: true } }),
      this.prisma.payment.aggregate({ where: { orgId, createdAt: { gte: monthStart } }, _sum: { amountMillimes: true } }),
    ]);

    return {
      today: todaySum._sum.amountMillimes || 0,
      week: weekSum._sum.amountMillimes || 0,
      month: monthSum._sum.amountMillimes || 0,
    };
  }

  async getGymAttendance(orgId: string, query: any) {
    const where: any = { orgId, type: 'check_in' };
    if (query.date) {
      const dayStart = new Date(query.date);
      const dayEnd = new Date(query.date);
      dayEnd.setDate(dayEnd.getDate() + 1);
      where.createdAt = { gte: dayStart, lt: dayEnd };
    }

    const events = await this.prisma.event.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: parseInt(query.pageSize) || 100,
    });

    const memberNames = new Map<string, string>();
    const memberIds = events.map((e) => (e.payload as any)?.memberId).filter(Boolean);
    if (memberIds.length > 0) {
      const customers = await this.prisma.customer.findMany({
        where: { id: { in: memberIds } },
        select: { id: true, name: true },
      });
      customers.forEach((c) => memberNames.set(c.id, c.name));
    }

    return events.map((e) => {
      const payload = e.payload as any;
      const fullName = payload?.memberName || memberNames.get(payload?.memberId) || 'Unknown';
      const parts = fullName.split(' ');
      return {
        id: e.id,
        memberId: payload?.memberId || '',
        member: payload?.memberId
          ? { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') || '' }
          : null,
        gymId: orgId,
        checkedAt: e.createdAt.toISOString(),
        method: payload?.method || 'MANUAL',
      };
    });
  }

  async checkIn(orgId: string, data: any) {
    let memberName = 'Unknown';
    if (data.memberId) {
      const member = await this.prisma.customer.findUnique({
        where: { id: data.memberId },
        select: { name: true },
      });
      if (member) memberName = member.name;
    }

    const event = await this.prisma.event.create({
      data: {
        orgId,
        type: 'check_in',
        payload: {
          memberId: data.memberId || null,
          memberName,
          method: data.method || 'MANUAL',
        },
      },
    });

    return {
      id: event.id,
      memberId: data.memberId || '',
      member: { name: memberName },
      gymId: orgId,
      checkedAt: event.createdAt.toISOString(),
      method: data.method || 'MANUAL',
    };
  }

  async getGymMemberships(orgId: string) {
    return this.prisma.gymMembership.findMany({
      where: { orgId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true, attributes: true },
        },
      },
      orderBy: { endDate: 'desc' },
    });
  }
}
