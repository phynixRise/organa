import { Controller, Get, Post, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/appointments')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  findAll(
    @Param('orgId') orgId: string,
    @Query('start') start?: string,
    @Query('end') end?: string,
  ) {
    return this.appointmentsService.findAll(orgId, start, end);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.appointmentsService.findOne(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any) {
    return this.appointmentsService.create(orgId, body);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.appointmentsService.update(orgId, id, body);
  }

  @Patch(':id/cancel')
  cancel(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.appointmentsService.cancel(orgId, id);
  }

  @Patch(':id/complete')
  complete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.appointmentsService.complete(orgId, id);
  }
}
