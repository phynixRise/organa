import { Module } from '@nestjs/common';
import { StaffShiftsService } from './staff-shifts.service';
import { StaffShiftsController } from './staff-shifts.controller';

@Module({
  controllers: [StaffShiftsController],
  providers: [StaffShiftsService],
  exports: [StaffShiftsService],
})
export class StaffShiftsModule {}
