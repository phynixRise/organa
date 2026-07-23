import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuperAdminService {
  constructor(private prisma: PrismaService) {}

  private async verifySuperAdmin(accountId: string) {
    const admin = await this.prisma.platformAdmin.findUnique({
      where: { accountId },
    });

    if (!admin) {
      throw new ForbiddenException('Not a platform admin');
    }

    return admin;
  }

  async getAllOrganizations(accountId: string) {
    await this.verifySuperAdmin(accountId);

    return this.prisma.organization.findMany({
      include: {
        owner: { select: { id: true, email: true, fullName: true } },
        _count: { select: { memberships: true, orders: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(accountId: string) {
    await this.verifySuperAdmin(accountId);

    const [totalOrgs, activeSubscriptions, totalRevenue] = await Promise.all([
      this.prisma.organization.count({ where: { status: 'active' } }),
      this.prisma.subscription.count({ where: { status: 'active' } }),
      this.prisma.subscriptionPayment.aggregate({
        where: { status: 'paid' },
        _sum: { amountMillimes: true },
      }),
    ]);

    return {
      totalOrgs,
      activeSubscriptions,
      totalRevenueMillimes: totalRevenue._sum.amountMillimes || 0,
    };
  }

  async suspendOrg(accountId: string, orgId: string) {
    await this.verifySuperAdmin(accountId);

    return this.prisma.organization.update({
      where: { id: orgId },
      data: { status: 'suspended' },
    });
  }

  async reinstateOrg(accountId: string, orgId: string) {
    await this.verifySuperAdmin(accountId);

    return this.prisma.organization.update({
      where: { id: orgId },
      data: { status: 'active' },
    });
  }
}
