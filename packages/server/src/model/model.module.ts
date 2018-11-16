import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { config } from 'dotenv';
import { EventAttendeeModule } from './event-attendee/event-attendee.module';
import { EventModelModule } from './event/event-model.module';

config();

@Module({
  imports: [
    UserModule,
    EventModelModule,
    EventAttendeeModule,
  ],
  exports: [
    UserModule,
    EventModelModule,
    EventAttendeeModule
  ]
})
export class ModelModule {}
