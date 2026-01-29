import { Module } from '@nestjs/common';
import { ActivityModule } from '../activity/activity.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PactsController } from './pacts.controller';
import { PactsService } from './pacts.service';

@Module({
  imports: [ActivityModule, NotificationsModule],
  controllers: [PactsController],
  providers: [PactsService],
})
export class PactsModule {}
