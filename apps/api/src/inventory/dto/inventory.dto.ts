import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class SetStockDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number;
}

export class AdjustStockDto {
  @IsNumber()
  @Min(1)
  qty: number;
}
