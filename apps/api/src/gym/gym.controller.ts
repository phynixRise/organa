import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GymService } from './gym.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('organizations/:orgId')
@UseGuards(JwtAuthGuard)
export class GymController {
  constructor(
    private gymService: GymService,
    private prisma: PrismaService,
  ) {}

  @Get('gym-dashboard/stats')
  getStats(@Param('orgId') orgId: string) {
    return this.gymService.getDashboardStats(orgId);
  }

  @Get('gym-dashboard/activity')
  getActivity(@Param('orgId') orgId: string) {
    return this.gymService.getActivityFeed(orgId);
  }

  @Get('gym-dashboard/alerts')
  getAlerts(@Param('orgId') orgId: string) {
    return this.gymService.getExpiringAlerts(orgId);
  }

  @Get('gym-dashboard/revenue')
  getRevenue(@Param('orgId') orgId: string) {
    return this.gymService.getRevenueChart(orgId);
  }

  @Get('gym-plans')
  getPlans(@Param('orgId') orgId: string) {
    return this.gymService.getGymPlans(orgId);
  }

  @Post('gym-plans')
  createPlan(@Param('orgId') orgId: string, @Body() body: any) {
    return this.gymService.createGymPlan(orgId, body);
  }

  @Put('gym-plans/:id')
  updatePlan(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.gymService.updateGymPlan(orgId, id, body);
  }

  @Delete('gym-plans/:id')
  deletePlan(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.gymService.deleteGymPlan(orgId, id);
  }

  @Get('gym-payments')
  getPayments(@Param('orgId') orgId: string, @Query() query: any) {
    return this.gymService.getGymPayments(orgId, query);
  }

  @Get('gym-payments/summary')
  getPaymentSummary(@Param('orgId') orgId: string) {
    return this.gymService.getPaymentSummary(orgId);
  }

  @Post('gym-payments')
  recordPayment(@Param('orgId') orgId: string, @Body() body: any) {
    return this.gymService.getGymPayments(orgId, { page: 1, pageSize: 1 });
  }

  @Get('gym-attendance')
  getAttendance(@Param('orgId') orgId: string, @Query() query: any) {
    return this.gymService.getGymAttendance(orgId, query);
  }

  @Post('gym-attendance')
  checkIn(@Param('orgId') orgId: string, @Body() body: any) {
    return this.gymService.checkIn(orgId, body);
  }

  @Post('gym-subscriptions/:id/freeze')
  freezeSubscription() {
    return { success: true };
  }

  @Post('gym-subscriptions/:id/reactivate')
  reactivateSubscription() {
    return { success: true };
  }

  @Get('gym-memberships')
  getMemberships(@Param('orgId') orgId: string) {
    return this.gymService.getGymMemberships(orgId);
  }

  @Get('customers/:memberId/subscriptions')
  async getMemberSubscriptions(
    @Param('orgId') orgId: string,
    @Param('memberId') memberId: string,
  ) {
    return this.prisma.gymMembership.findMany({
      where: { orgId, customerId: memberId },
      include: { customer: { select: { name: true, email: true } } },
    });
  }

  @Post('customers/:memberId/subscriptions')
  createMemberSubscription() {
    return { success: true };
  }
}
