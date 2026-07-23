import { IsString, IsOptional, IsIn, IsDateString } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  staffAccountId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}

export class UpdateAppointmentDto {
  @IsString()
  @IsOptional()
  customerId?: string;

  @IsString()
  @IsOptional()
  staffAccountId?: string;

  @IsString()
  @IsOptional()
  locationId?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  @IsIn(['booked', 'completed', 'cancelled', 'no_show'])
  status?: string;
}
