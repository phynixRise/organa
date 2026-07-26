import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(accountId: string, dto: CreateOrganizationDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: { accountId, status: 'active' },
      include: { plan: true },
    });

    if (subscription?.plan?.maxOrgs) {
      const orgCount = await this.prisma.membership.count({
        where: {
          accountId,
          role: 'owner',
          org: { status: 'active' },
        },
      });

      if (orgCount >= subscription.plan.maxOrgs) {
        throw new ForbiddenException(
          `Your plan allows a maximum of ${subscription.plan.maxOrgs} businesses. Upgrade to create more.`,
        );
      }
    }

    const org = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
          businessType: dto.businessType,
          subdomain: dto.subdomain,
          ownerAccountId: accountId,
        },
      });

      await tx.membership.create({
        data: {
          accountId,
          orgId: organization.id,
          role: 'owner',
        },
      });

      return organization;
    });

    return org;
  }

  async findAllForAccount(accountId: string) {
    const memberships = await this.prisma.membership.findMany({
      where: { accountId },
      include: {
        org: {
          select: {
            id: true,
            name: true,
            businessType: true,
            status: true,
            subdomain: true,
            defaultCurrency: true,
            timezone: true,
            locale: true,
            createdAt: true,
          },
        },
      },
    });

    return memberships.map((m) => ({
      ...m.org,
      role: m.role,
    }));
  }

  async findOne(orgId: string, accountId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
      include: { org: true },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found or access denied');
    }

    return membership.org;
  }

  async update(orgId: string, accountId: string, dto: UpdateOrganizationDto) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
    });

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only the owner can update this organization');
    }

    const org = await this.prisma.organization.findUnique({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return this.prisma.organization.update({
      where: { id: orgId },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.subdomain !== undefined ? { subdomain: dto.subdomain } : {}),
        ...(dto.timezone !== undefined ? { timezone: dto.timezone } : {}),
        ...(dto.locale !== undefined ? { locale: dto.locale } : {}),
        ...(dto.hardwarePackage !== undefined ? { hardwarePackage: dto.hardwarePackage } : {}),
      },
    });
  }

  async delete(orgId: string, accountId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
    });

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only the owner can delete this organization');
    }

    await this.prisma.organization.update({
      where: { id: orgId },
      data: { status: 'cancelled' },
    });

    return { message: 'Organization deactivated' };
  }

  async inviteMember(orgId: string, accountId: string, dto: InviteMemberDto) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
    });

    if (!membership || !['owner', 'manager'].includes(membership.role)) {
      throw new ForbiddenException('Only owners and managers can invite members');
    }

    const targetAccount = await this.prisma.account.findFirst({
      where: { email: dto.email.toLowerCase() },
    });

    if (!targetAccount) {
      throw new NotFoundException('No account found with this email. They need to sign up first.');
    }

    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId: targetAccount.id, orgId },
      },
    });

    if (existingMembership) {
      throw new ConflictException('This person is already a member of this organization');
    }

    const newMembership = await this.prisma.membership.create({
      data: {
        accountId: targetAccount.id,
        orgId,
        role: dto.role,
      },
    });

    return newMembership;
  }

  async getMembers(orgId: string, accountId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Organization not found or access denied');
    }

    const members = await this.prisma.membership.findMany({
      where: { orgId },
      include: {
        account: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    return members.map((m) => ({
      id: m.account.id,
      email: m.account.email,
      fullName: m.account.fullName,
      role: m.role,
      joinedAt: m.createdAt,
    }));
  }

  async getCombinedStats(accountId: string, query: { type?: string; period?: string; orgId?: string }) {
    const memberships = await this.prisma.membership.findMany({
      where: { accountId },
      include: {
        org: {
          select: { id: true, name: true, businessType: true, status: true, createdAt: true },
        },
      },
    });

    let orgIds = memberships.filter((m) => m.org.status === 'active').map((m) => m.org.id);

    if (query.orgId) {
      orgIds = orgIds.filter((id) => id === query.orgId);
    }

    if (query.type && query.type !== 'ALL') {
      const typeMap: Record<string, string[]> = {
        cafe: ['cafe', 'restaurant'],
        gym: ['gym', 'fitness'],
        boutique: ['boutique', 'tienda'],
        hotel: ['hotel'],
        rental_property: ['rental_property'],
        cabinet_medical: ['cabinet_medical'],
      };
      const types = typeMap[query.type] || [query.type];
      orgIds = orgIds.filter((id) => {
        const m = memberships.find((mm) => mm.org.id === id);
        return m && types.includes(m.org.businessType);
      });
    }

    const now = new Date();
    let dateFrom: Date | null = null;
    const period = query.period || 'all';
    if (period === 'day') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (period === 'week') {
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === 'month') {
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'year') {
      dateFrom = new Date(now.getFullYear(), 0, 1);
    }

    const orderWhere: any = {};
    if (orgIds.length > 0) orderWhere.orgId = { in: orgIds };
    if (dateFrom) orderWhere.createdAt = { gte: dateFrom };

    const [orders, payments, allCustomers, perOrgOrders] = await Promise.all([
      this.prisma.order.findMany({
        where: orderWhere,
        select: { id: true, orgId: true, totalMillimes: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.payment.findMany({
        where: {
          ...(orgIds.length > 0 ? { orgId: { in: orgIds } } : {}),
          ...(dateFrom ? { createdAt: { gte: dateFrom } } : {}),
        },
        select: { id: true, orgId: true, amountMillimes: true, method: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
      this.prisma.customer.findMany({
        where: orgIds.length > 0 ? { orgId: { in: orgIds } } : {},
        select: { id: true, orgId: true, name: true, createdAt: true },
      }),
      this.prisma.order.groupBy({
        by: ['orgId'],
        where: orderWhere,
        _sum: { totalMillimes: true },
        _count: { id: true },
      }),
    ]);

    const totalRevenue = orders.reduce((s, o) => s + (o.totalMillimes || 0), 0);
    const totalPayments = payments.reduce((s, p) => s + (p.amountMillimes || 0), 0);
    const totalOrders = orders.length;
    const totalCustomers = allCustomers.length;

    const orgStats = memberships
      .filter((m) => m.org.status === 'active' && orgIds.includes(m.org.id))
      .map((m) => {
        const orgOrders = orders.filter((o) => o.orgId === m.org.id);
        const orgPayments = payments.filter((p) => p.orgId === m.org.id);
        const orgCustomers = allCustomers.filter((c) => c.orgId === m.org.id);
        const grouped = perOrgOrders.find((g) => g.orgId === m.org.id);
        return {
          orgId: m.org.id,
          orgName: m.org.name,
          businessType: m.org.businessType,
          totalRevenue: grouped?._sum?.totalMillimes || orgOrders.reduce((s, o) => s + (o.totalMillimes || 0), 0),
          totalOrders: grouped?._count?.id || orgOrders.length,
          totalCustomers: orgCustomers.length,
          totalPayments: orgPayments.length,
          recentOrders: orgOrders.slice(0, 5),
        };
      });

    const monthlyRevenue: { month: string; revenue: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const label = d.toLocaleString('en', { month: 'short' });
      const rev = orders
        .filter((o) => o.createdAt >= d && o.createdAt <= monthEnd)
        .reduce((s, o) => s + (o.totalMillimes || 0), 0);
      monthlyRevenue.push({ month: label, revenue: rev });
    }

    return {
      totals: { revenue: totalRevenue, payments: totalPayments, orders: totalOrders, customers: totalCustomers },
      orgStats,
      monthlyRevenue,
      orgs: memberships.filter((m) => m.org.status === 'active').map((m) => ({
        id: m.org.id,
        name: m.org.name,
        businessType: m.org.businessType,
      })),
    };
  }

  async removeMember(orgId: string, accountId: string, targetAccountId: string) {
    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId, orgId },
      },
    });

    if (!membership || membership.role !== 'owner') {
      throw new ForbiddenException('Only the owner can remove members');
    }

    if (targetAccountId === accountId) {
      throw new ForbiddenException('Owner cannot remove themselves');
    }

    await this.prisma.membership.delete({
      where: {
        accountId_orgId: { accountId: targetAccountId, orgId },
      },
    });

    return { message: 'Member removed' };
  }
}
