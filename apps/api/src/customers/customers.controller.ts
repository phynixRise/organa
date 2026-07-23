import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

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
  create(@Param('orgId') orgId: string, @Body() dto: CreateCustomerDto) {
    return this.customersService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customersService.update(orgId, id, dto);
  }

  @Delete(':id')
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.customersService.delete(orgId, id);
  }
}
