import { Module } from '@nestjs/common';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { ModelModule } from '../model/model.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsService } from './notifications/notifications.service';

@Module({
  imports: [ModelModule, AuthModule],
  controllers: [EventController],
  providers: [EventService, NotificationsService]
})
export class EventModule {}
