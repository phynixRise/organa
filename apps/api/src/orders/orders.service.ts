import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, status?: string) {
    return this.prisma.order.findMany({
      where: {
        orgId,
        ...(status ? { status } : {}),
      },
      include: {
        items: { include: { product: true } },
        customer: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, orgId },
      include: {
        items: { include: { product: true } },
        customer: true,
        location: true,
        payments: true,
        staffAccount: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async create(orgId: string, data: {
    customerId?: string;
    locationId?: string;
    staffAccountId?: string;
    items: { productId: string; qty: number; priceMillimes: number }[];
  }) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Order must have at least one item');
    }

    const totalMillimes = data.items.reduce(
      (sum, item) => sum + item.priceMillimes * item.qty,
      0,
    );

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orgId,
          customerId: data.customerId,
          locationId: data.locationId,
          staffAccountId: data.staffAccountId,
          totalMillimes,
          items: {
            create: data.items.map((item) => ({
              orgId,
              productId: item.productId,
              qty: item.qty,
              priceMillimes: item.priceMillimes,
            })),
          },
        },
        include: { items: true },
      });

      for (const item of data.items) {
        const stock = await tx.inventoryStock.findFirst({
          where: { orgId, productId: item.productId },
        });

        if (stock && stock.quantity >= item.qty) {
          await tx.inventoryStock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity - item.qty },
          });
        }
      }

      await tx.event.create({
        data: {
          orgId,
          type: 'order.created',
          payload: JSON.stringify({ orderId: order.id, totalMillimes }),
        },
      });

      return order;
    });
  }

  async complete(orgId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, orgId, status: 'open' },
    });

    if (!order) {
      throw new NotFoundException('Open order not found');
    }

    return this.prisma.order.update({
      where: { id },
      data: { status: 'completed' },
    });
  }

  async cancel(orgId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, orgId, status: 'open' },
    });

    if (!order) {
      throw new NotFoundException('Open order not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: { orderId: id },
      });

      for (const item of items) {
        const stock = await tx.inventoryStock.findFirst({
          where: { orgId, productId: item.productId },
        });

        if (stock) {
          await tx.inventoryStock.update({
            where: { id: stock.id },
            data: { quantity: stock.quantity + item.qty },
          });
        }
      }

      return tx.order.update({
        where: { id },
        data: { status: 'cancelled' },
      });
    });
  }
}
