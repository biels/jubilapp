import { Module } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventAttendee } from './event-attendee.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EventAttendee])],
})
export class EventAttendeeModule {}
