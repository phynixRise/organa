import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.payment.findMany({
      where: { orgId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async create(orgId: string, data: {
    orderId: string;
    amountMillimes: number;
    method: string;
    provider?: string;
  }) {
    const order = await this.prisma.order.findFirst({
      where: { id: data.orderId, orgId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== 'open') {
      throw new BadRequestException(`Cannot payment for order with status: ${order.status}`);
    }

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          orgId,
          orderId: data.orderId,
          amountMillimes: data.amountMillimes,
          method: data.method,
          provider: data.provider,
          status: data.method === 'cash' ? 'paid' : 'pending',
        },
      });

      const totalPaid = await tx.payment.aggregate({
        where: { orderId: data.orderId, status: 'paid' },
        _sum: { amountMillimes: true },
      });

      const totalPaidAmount = (totalPaid._sum.amountMillimes || 0) +
        (payment.status === 'paid' ? payment.amountMillimes : 0);

      if (totalPaidAmount >= order.totalMillimes) {
        await tx.order.update({
          where: { id: data.orderId },
          data: { status: 'completed' },
        });
      }

      return payment;
    });
  }

  async updateStatus(orgId: string, id: string, status: string) {
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const payment = await this.prisma.payment.findFirst({
      where: { id, orgId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status },
    });
  }
}
