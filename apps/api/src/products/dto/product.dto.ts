import { IsString, IsNumber, IsBoolean, IsOptional, IsIn } from 'class-validator';

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  @IsIn(['product', 'service'])
  type: string;

  @IsNumber()
  priceMillimes: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsOptional()
  attributes?: Record<string, any>;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsIn(['product', 'service'])
  type?: string;

  @IsNumber()
  @IsOptional()
  priceMillimes?: number;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsOptional()
  attributes?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
