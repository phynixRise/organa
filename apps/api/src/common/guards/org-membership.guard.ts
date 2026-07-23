import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrgMembershipGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Not authenticated');
    }

    const orgId = request.params.orgId;

    if (!orgId) {
      return true;
    }

    const membership = await this.prisma.membership.findUnique({
      where: {
        accountId_orgId: { accountId: user.sub, orgId },
      },
    });

    if (!membership) {
      throw new ForbiddenException('You do not have access to this organization');
    }

    request.membership = membership;
    return true;
  }
}
