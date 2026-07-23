import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';

@Controller('organizations/:orgId/events')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.eventsService.findAll(orgId);
  }

  @Get('unprocessed')
  getUnprocessed(@Param('orgId') orgId: string) {
    return this.eventsService.getUnprocessed(orgId);
  }

  @Patch(':id/process')
  markProcessed(@Param('id') id: string) {
    return this.eventsService.markProcessed(id);
  }
}
