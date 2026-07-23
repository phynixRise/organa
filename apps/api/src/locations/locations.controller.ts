import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/locations')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.locationsService.findAll(orgId);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.locationsService.findOne(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() body: any) {
    return this.locationsService.create(orgId, body);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() body: any) {
    return this.locationsService.update(orgId, id, body);
  }

  @Delete(':id')
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.locationsService.delete(orgId, id);
  }
}
