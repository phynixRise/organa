import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.customer.findMany({
      where: { orgId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const customer = await this.prisma.customer.findFirst({
      where: { id, orgId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    return customer;
  }

  async create(orgId: string, data: { name: string; phone?: string; email?: string; attributes?: any }) {
    return this.prisma.customer.create({
      data: {
        orgId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        attributes: typeof data.attributes === 'string' ? data.attributes : JSON.stringify(data.attributes || {}),
      },
    });
  }

  async update(orgId: string, id: string, data: { name?: string; phone?: string; email?: string; attributes?: any }) {
    await this.findOne(orgId, id);
    return this.prisma.customer.update({
      where: { id },
      data: {
        ...data,
        ...(data.attributes !== undefined ? { attributes: typeof data.attributes === 'string' ? data.attributes : JSON.stringify(data.attributes) } : {}),
      },
    });
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.customer.delete({ where: { id } });
    return { message: 'Customer deleted' };
  }
}
