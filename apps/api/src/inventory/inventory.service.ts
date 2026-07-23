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
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { orgId_productId: { orgId, productId } },
    });

    if (!stock) {
      throw new NotFoundException('Stock record not found');
    }

    if (stock.quantity < qty) {
      throw new BadRequestException(`Insufficient stock. Available: ${stock.quantity}, requested: ${qty}`);
    }

    return this.prisma.inventoryStock.update({
      where: { id: stock.id },
      data: { quantity: stock.quantity - qty },
    });
  }

  async incrementStock(orgId: string, productId: string, qty: number) {
    const stock = await this.prisma.inventoryStock.findUnique({
      where: { orgId_productId: { orgId, productId } },
    });

    if (!stock) {
      throw new NotFoundException('Stock record not found');
    }

    return this.prisma.inventoryStock.update({
      where: { id: stock.id },
      data: { quantity: stock.quantity + qty },
    });
  }

  async getLowStock(orgId: string) {
    const allStock = await this.prisma.inventoryStock.findMany({
      where: { orgId },
      include: { product: true },
    });

    return allStock.filter((s) => s.quantity <= s.reorderLevel);
  }
}
