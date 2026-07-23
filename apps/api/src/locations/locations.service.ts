import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.location.findMany({ where: { orgId } });
  }

  async findOne(orgId: string, id: string) {
    const location = await this.prisma.location.findFirst({ where: { id, orgId } });
    if (!location) throw new NotFoundException('Location not found');
    return location;
  }

  async create(orgId: string, data: { name: string; attributes?: any }) {
    return this.prisma.location.create({
      data: {
        orgId,
        name: data.name,
        attributes: data.attributes ?? {},
      },
    });
  }

  async update(orgId: string, id: string, data: { name?: string; attributes?: any }) {
    await this.findOne(orgId, id);
    return this.prisma.location.update({
      where: { id },
      data: {
        ...data,
        ...(data.attributes !== undefined ? { attributes: data.attributes } : {}),
      },
    });
  }

  async delete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    await this.prisma.location.delete({ where: { id, orgId } });
    return { message: 'Location deleted' };
  }
}
