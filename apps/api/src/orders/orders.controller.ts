import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('organizations/:orgId/orders')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(@Param('orgId') orgId: string, @Query('status') status?: string) {
    return this.ordersService.findAll(orgId, status);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.ordersService.findOne(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any, @CurrentUser() user: { sub: string }) {
    return this.ordersService.create(orgId, {
      ...body,
      staffAccountId: body.staffAccountId || user.sub,
    });
  }

  @Patch(':id/complete')
  complete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.ordersService.complete(orgId, id);
  }

  @Patch(':id/cancel')
  cancel(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.ordersService.cancel(orgId, id);
  }
}
