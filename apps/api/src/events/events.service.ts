import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.event.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getUnprocessed(orgId?: string) {
    return this.prisma.event.findMany({
      where: {
        processedAt: null,
        attempts: { lt: 5 },
        ...(orgId ? { orgId } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });
  }

  async markProcessed(id: string) {
    return this.prisma.event.update({
      where: { id },
      data: { processedAt: new Date() },
    });
  }

  async markFailed(id: string, error: string) {
    return this.prisma.event.update({
      where: { id },
      data: {
        attempts: { increment: 1 },
        lastError: error,
      },
    });
  }

  async log(orgId: string, type: string, payload: any) {
    return this.prisma.event.create({
      data: {
        orgId,
        type,
        payload: payload ?? {},
      },
    });
  }

  async processEvents() {
    const events = await this.getUnprocessed();
    if (events.length === 0) return;

    this.logger.log(`Processing ${events.length} unprocessed events`);

    for (const event of events) {
      try {
        await this.processEvent(event);
        await this.markProcessed(event.id);
      } catch (error: any) {
        this.logger.warn(`Failed to process event ${event.id} (${event.type}): ${error.message}`);
        await this.markFailed(event.id, error.message);
      }
    }
  }

  private async processEvent(event: { id: string; type: string; payload: any; orgId: string }) {
    switch (event.type) {
      case 'order.created':
        this.logger.log(`Order created: ${(event.payload as any)?.orderId}`);
        break;
      case 'payment.received':
        this.logger.log(`Payment received: ${(event.payload as any)?.orderId}`);
        break;
      case 'check_in':
        this.logger.log(`Check-in: ${(event.payload as any)?.memberName}`);
        break;
      case 'membership.expiring':
        this.logger.log(`Membership expiring: ${(event.payload as any)?.memberId}`);
        break;
      default:
        this.logger.debug(`Unhandled event type: ${event.type}`);
    }
  }
}
