import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrgFeaturesService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.orgFeature.findMany({ where: { orgId } });
  }

  async isEnabled(orgId: string, featureKey: string): Promise<boolean> {
    const feature = await this.prisma.orgFeature.findUnique({
      where: { orgId_featureKey: { orgId, featureKey } },
    });

    return feature?.enabled ?? false;
  }

  async toggle(orgId: string, featureKey: string, enabled: boolean, config?: any) {
    return this.prisma.orgFeature.upsert({
      where: { orgId_featureKey: { orgId, featureKey } },
      update: { enabled, config: config || undefined },
      create: { orgId, featureKey, enabled, config: config || {} },
    });
  }
}
