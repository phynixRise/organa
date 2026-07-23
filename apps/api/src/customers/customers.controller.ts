import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/customers')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.customersService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.customersService.findOne(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any) {
    return this.customersService.create(orgId, body);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.customersService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.customersService.delete(orgId, id);
  }
}
