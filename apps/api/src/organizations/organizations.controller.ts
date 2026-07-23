import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, UpdateOrganizationDto, InviteMemberDto } from './dto/organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('organizations')
@UseGuards(JwtAuthGuard)
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Post()
  create(@CurrentUser() user: { sub: string }, @Body() dto: CreateOrganizationDto) {
    return this.orgService.create(user.sub, dto);
  }

  @Get()
  findAll(@CurrentUser() user: { sub: string }) {
    return this.orgService.findAllForAccount(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.orgService.findOne(id, user.sub);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.orgService.update(id, user.sub, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.orgService.delete(id, user.sub);
  }

  @Post(':id/members')
  inviteMember(
    @Param('id') id: string,
    @CurrentUser() user: { sub: string },
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgService.inviteMember(id, user.sub, dto);
  }

  @Get(':id/members')
  getMembers(@Param('id') id: string, @CurrentUser() user: { sub: string }) {
    return this.orgService.getMembers(id, user.sub);
  }

  @Delete(':id/members/:targetId')
  removeMember(
    @Param('id') id: string,
    @Param('targetId') targetId: string,
    @CurrentUser() user: { sub: string },
  ) {
    return this.orgService.removeMember(id, user.sub, targetId);
  }
}
