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

    const payment = await this.prisma.payment.create({
      data: {
        orgId,
        orderId: data.orderId,
        amountMillimes: data.amountMillimes,
        method: data.method as any,
        provider: data.provider,
        status: data.method === 'cash' ? 'paid' : 'pending',
      },
    });

    // If full payment received, mark order as completed
    const totalPaid = await this.prisma.payment.aggregate({
      where: { orderId: data.orderId, status: 'paid' },
      _sum: { amountMillimes: true },
    });

    const totalPaidAmount = (totalPaid._sum.amountMillimes || 0) + (payment.status === 'paid' ? payment.amountMillimes : 0);

    if (totalPaidAmount >= order.totalMillimes) {
      await this.prisma.order.update({
        where: { id: data.orderId },
        data: { status: 'completed' },
      });
    }

    return payment;
  }

  async updateStatus(orgId: string, id: string, status: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id, orgId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return this.prisma.payment.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
