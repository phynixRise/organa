import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { StaffShiftsService } from './staff-shifts.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/staff-shifts')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class StaffShiftsController {
  constructor(private readonly staffShiftsService: StaffShiftsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.staffShiftsService.findAll(orgId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any) {
    return this.staffShiftsService.create(orgId, body);
  }

  @Delete(':id')
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.staffShiftsService.delete(orgId, id);
  }
}
