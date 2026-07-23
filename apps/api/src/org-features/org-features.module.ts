import { Module } from '@nestjs/common';
import { OrgFeaturesService } from './org-features.service';

@Module({
  providers: [OrgFeaturesService],
  exports: [OrgFeaturesService],
})
export class OrgFeaturesModule {}
