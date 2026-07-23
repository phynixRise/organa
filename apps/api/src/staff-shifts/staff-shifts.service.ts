import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StaffShiftsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string) {
    return this.prisma.staffShift.findMany({
      where: { orgId },
      include: { account: { select: { id: true, fullName: true, email: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async create(orgId: string, data: { accountId: string; startTime: string; endTime: string }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    return this.prisma.staffShift.create({
      data: { orgId, accountId: data.accountId, startTime: start, endTime: end },
    });
  }

  async delete(orgId: string, id: string) {
    const shift = await this.prisma.staffShift.findFirst({ where: { id, orgId } });
    if (!shift) throw new NotFoundException('Shift not found');
    await this.prisma.staffShift.delete({ where: { id } });
    return { message: 'Shift deleted' };
  }
}
