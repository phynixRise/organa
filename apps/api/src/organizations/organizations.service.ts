import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from './dto/organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(accountId: string, dto: CreateOrganizationDto) {
    // Check plan limits
    const subscription = await this.prisma.subscription.findFirst({
      where: { accountId, status: 'active' },
      include: { plan: true },
    });

    if (subscription?.plan?.maxOrgs) {
      const orgCount = await this.prisma.membership.count({
        where: { accountId, role: 'owner' },
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
          businessType: dto.businessType as any,
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

    const org = await this.prisma.organization.update({
      where: { id: orgId },
      data: dto as any,
    });

    return org;
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
        role: dto.role as any,
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
