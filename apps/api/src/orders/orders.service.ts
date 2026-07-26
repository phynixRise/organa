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
      take: 100,
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
      for (const item of data.items) {
        const product = await tx.productService.findFirst({
          where: { id: item.productId, orgId },
        });
        if (!product) {
          throw new BadRequestException(`Product ${item.productId} not found in this organization`);
        }
      }

      for (const item of data.items) {
        const result = await tx.$executeRawUnsafe(
          `UPDATE inventory_stock
           SET quantity = quantity - $1, updated_at = now()
           WHERE org_id = $2::uuid AND product_id = $3::uuid AND quantity >= $1`,
          item.qty, orgId, item.productId,
        );
        if (result === 0) {
          const stock = await tx.$queryRaw<{ quantity: number }[]>`
            SELECT quantity FROM inventory_stock
            WHERE org_id = ${orgId}::uuid AND product_id = ${item.productId}::uuid
          `;
          const available = stock.length > 0 ? stock[0].quantity : 0;
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}. Available: ${available}, requested: ${item.qty}`,
          );
        }
      }

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

      await tx.event.create({
        data: {
          orgId,
          type: 'order.created',
          payload: { orderId: order.id, totalMillimes },
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
        const stock = await tx.$queryRaw<{ id: string; quantity: number }[]>`
          SELECT id, quantity FROM inventory_stock
          WHERE org_id = ${orgId}::uuid AND product_id = ${item.productId}::uuid
          FOR UPDATE
        `;

        if (stock.length > 0) {
          await tx.inventoryStock.update({
            where: { id: stock[0].id },
            data: { quantity: stock[0].quantity + item.qty },
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
