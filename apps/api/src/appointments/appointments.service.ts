import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(orgId: string, start?: string, end?: string) {
    const where: any = { orgId };

    if (start || end) {
      where.AND = [];
      if (start) where.AND.push({ startTime: { gte: new Date(start) } });
      if (end) where.AND.push({ endTime: { lte: new Date(end) } });
    }

    return this.prisma.appointment.findMany({
      where,
      include: { customer: true, location: true, staffAccount: { select: { id: true, fullName: true } } },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(orgId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, orgId },
      include: { customer: true, location: true, staffAccount: { select: { id: true, fullName: true, email: true } } },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async create(orgId: string, data: {
    customerId?: string;
    staffAccountId?: string;
    locationId?: string;
    startTime: string;
    endTime: string;
  }) {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);

    if (end <= start) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for staff double-booking (Postgres EXCLUDE constraint handles this too)
    if (data.staffAccountId) {
      const conflict = await this.prisma.appointment.findFirst({
        where: {
          orgId,
          staffAccountId: data.staffAccountId,
          status: 'booked',
          startTime: { lt: end },
          endTime: { gt: start },
        },
      });

      if (conflict) {
        throw new BadRequestException('Staff member already has an appointment at this time');
      }
    }

    return this.prisma.appointment.create({
      data: {
        orgId,
        customerId: data.customerId,
        staffAccountId: data.staffAccountId,
        locationId: data.locationId,
        startTime: start,
        endTime: end,
      },
    });
  }

  async update(orgId: string, id: string, data: any) {
    await this.findOne(orgId, id);
    return this.prisma.appointment.update({
      where: { id },
      data,
    });
  }

  async cancel(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  async complete(orgId: string, id: string) {
    await this.findOne(orgId, id);
    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'completed' },
    });
  }
}
