import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';
import { SetStockDto, AdjustStockDto } from './dto/inventory.dto';

@Controller('organizations/:orgId/inventory')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.inventoryService.findAll(orgId);
  }

  @Get('low-stock')
  getLowStock(@Param('orgId') orgId: string) {
    return this.inventoryService.getLowStock(orgId);
  }

  @Get(':productId')
  findOne(@Param('orgId') orgId: string, @Param('productId') productId: string) {
    return this.inventoryService.findOne(orgId, productId);
  }

  @Post()
  setStock(@Param('orgId') orgId: string, @Body() dto: SetStockDto) {
    return this.inventoryService.setStock(orgId, dto.productId, dto.quantity, dto.reorderLevel);
  }

  @Patch(':productId/decrement')
  decrement(@Param('orgId') orgId: string, @Param('productId') productId: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.decrementStock(orgId, productId, dto.qty);
  }

  @Patch(':productId/increment')
  increment(@Param('orgId') orgId: string, @Param('productId') productId: string, @Body() dto: AdjustStockDto) {
    return this.inventoryService.incrementStock(orgId, productId, dto.qty);
  }
}
