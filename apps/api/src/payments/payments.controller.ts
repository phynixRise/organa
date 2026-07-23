import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/payments')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.paymentsService.findAll(orgId);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any) {
    return this.paymentsService.create(orgId, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('orgId') orgId: string, @Param('id') id: string, @Body('status') status: string) {
    return this.paymentsService.updateStatus(orgId, id, status);
  }
}
