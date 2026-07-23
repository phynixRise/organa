import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsNumber()
  amountMillimes: number;

  @IsString()
  @IsIn(['cash', 'card', 'online', 'wallet'])
  method: string;

  @IsString()
  @IsOptional()
  provider?: string;
}

export class UpdatePaymentStatusDto {
  @IsString()
  @IsIn(['pending', 'paid', 'failed', 'refunded'])
  status: string;
}
