import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.productService.findMany({
      where: { orgId, active: true },
      include: { inventoryStock: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const product = await this.prisma.productService.findFirst({
      where: { id, orgId },
      include: { inventoryStock: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findByBarcode(orgId: string, barcode: string) {
    const product = await this.prisma.productService.findFirst({
      where: { orgId, barcode, active: true },
      include: { inventoryStock: true },
    });

    if (!product) {
      throw new NotFoundException('No product found with this barcode');
    }

    return product;
  }

  async create(orgId: string, data: {
    name: string;
    type: string;
    priceMillimes: number;
    barcode?: string;
    attributes?: any;
  }) {
    return this.prisma.productService.create({
      data: {
        orgId,
        name: data.name,
        type: data.type,
        priceMillimes: data.priceMillimes,
        barcode: data.barcode,
        attributes: typeof data.attributes === 'string' ? data.attributes : JSON.stringify(data.attributes || {}),
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);
    return this.prisma.productService.update({
      where: { id },
      data: {
        ...data,
        ...(data.attributes !== undefined ? { attributes: typeof data.attributes === 'string' ? data.attributes : JSON.stringify(data.attributes) } : {}),
      },
    });
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.productService.update({
      where: { id },
      data: { active: false },
    });
    return { message: 'Product deactivated' };
  }
}
