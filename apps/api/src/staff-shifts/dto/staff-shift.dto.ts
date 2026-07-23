import { IsString, IsDateString } from 'class-validator';

export class CreateStaffShiftDto {
  @IsString()
  accountId: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;
}
