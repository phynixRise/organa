import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.inventoryStock.findMany({
      where: { orgId },
      include: { product: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(orgId: string, productId: string) {
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { orgId_productId: { orgId, productId } },
      include: { product: true },
    });

    if (!stock) {
      throw new NotFoundException('Stock record not found');
    }

    return stock;
  }

  async setStock(orgId: string, productId: string, quantity: number, reorderLevel?: number) {
    return this.prisma.inventoryStock.upsert({
      where: { orgId_productId: { orgId, productId } },
      update: {
        quantity,
        ...(reorderLevel !== undefined ? { reorderLevel } : {}),
      },
      create: {
        orgId,
        productId,
        quantity,
        reorderLevel: reorderLevel || 0,
      },
    });
  }

  async decrementStock(orgId: string, productId: string, qty: number) {
    const result = await this.prisma.$executeRaw`
      UPDATE inventory_stock
      SET quantity = quantity - ${qty}, updated_at = now()
      WHERE org_id = ${orgId}::uuid AND product_id = ${productId}::uuid AND quantity >= ${qty}
    `;

    if (result === 0) {
      const stock = await this.prisma.inventoryStock.findUnique({
        where: { orgId_productId: { orgId, productId } },
      });
      if (!stock) throw new NotFoundException('Stock record not found');
      throw new BadRequestException(`Insufficient stock. Available: ${stock.quantity}, requested: ${qty}`);
    }

    return this.prisma.inventoryStock.findUnique({
      where: { orgId_productId: { orgId, productId } },
    });
  }

  async incrementStock(orgId: string, productId: string, qty: number) {
    const result = await this.prisma.$executeRaw`
      UPDATE inventory_stock
      SET quantity = quantity + ${qty}, updated_at = now()
      WHERE org_id = ${orgId}::uuid AND product_id = ${productId}::uuid
    `;

    if (result === 0) {
      throw new NotFoundException('Stock record not found');
    }

    return this.prisma.inventoryStock.findUnique({
      where: { orgId_productId: { orgId, productId } },
    });
  }

  async getLowStock(orgId: string) {
    return this.prisma.$queryRaw`
      SELECT s.*, p.name as "productName"
      FROM inventory_stock s
      JOIN products_services p ON s.product_id = p.id
      WHERE s.org_id = ${orgId}::uuid AND s.quantity <= s.reorder_level
      ORDER BY s.updated_at DESC
    `;
  }
}
