import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { SuperAdminService } from './super-admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('super-admin')
@UseGuards(JwtAuthGuard)
export class SuperAdminController {
  constructor(private readonly superAdminService: SuperAdminService) {}

  @Get('organizations')
  getAllOrganizations(@CurrentUser() user: { sub: string }) {
    return this.superAdminService.getAllOrganizations(user.sub);
  }

  @Get('stats')
  getStats(@CurrentUser() user: { sub: string }) {
    return this.superAdminService.getStats(user.sub);
  }

  @Patch('organizations/:id/suspend')
  suspendOrg(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.superAdminService.suspendOrg(user.sub, id);
  }

  @Patch('organizations/:id/reinstate')
  reinstateOrg(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.superAdminService.reinstateOrg(user.sub, id);
  }
}
