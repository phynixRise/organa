import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventsService } from './events.service';

@Injectable()
export class EventProcessor {
  private readonly logger = new Logger(EventProcessor.name);

  constructor(private eventsService: EventsService) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async handleEventProcessing() {
    try {
      await this.eventsService.processEvents();
    } catch (error: any) {
      this.logger.error(`Event processor error: ${error.message}`);
    }
  }
}
