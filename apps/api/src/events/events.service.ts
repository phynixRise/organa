import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.event.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnprocessed(orgId: string) {
    return this.prisma.event.findMany({
      where: { orgId, processedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async markProcessed(id: string) {
    return this.prisma.event.update({
      where: { id },
      data: { processedAt: new Date() },
    });
  }

  async log(orgId: string, type: string, payload: any) {
    return this.prisma.event.create({
      data: {
        orgId,
        type,
        payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
      },
    });
  }
}
