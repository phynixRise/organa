import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventProcessor } from './event.processor';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [EventsController],
  providers: [EventsService, EventProcessor],
  exports: [EventsService],
})
export class EventsModule {}
