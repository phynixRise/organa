import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrgMembershipGuard } from '../common/guards/org-membership.guard';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Controller('organizations/:orgId/products')
@UseGuards(JwtAuthGuard, OrgMembershipGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(@Param('orgId') orgId: string) {
    return this.productsService.findAll(orgId);
  }

  @Get('barcode/:barcode')
  findByBarcode(@Param('orgId') orgId: string, @Param('barcode') barcode: string) {
    return this.productsService.findByBarcode(orgId, barcode);
  }

  @Get(':id')
  findOne(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productsService.findOne(orgId, id);
  }

  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateProductDto) {
    return this.productsService.create(orgId, dto);
  }

  @Put(':id')
  update(@Param('orgId') orgId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(orgId, id, dto);
  }

  @Delete(':id')
  delete(@Param('orgId') orgId: string, @Param('id') id: string) {
    return this.productsService.delete(orgId, id);
  }
}
