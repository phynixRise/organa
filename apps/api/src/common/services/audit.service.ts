import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(params: {
    orgId?: string;
    accountId?: string;
    action: string;
    entity: string;
    entityId?: string;
  }) {
    return this.prisma.auditLog.create({
      data: {
        orgId: params.orgId || null,
        accountId: params.accountId || null,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId || null,
      },
    });
  }
}
