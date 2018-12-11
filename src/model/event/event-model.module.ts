import { Module } from '@nestjs/common';
import { User } from '../user/user.entity';
import { UserRepository } from '../user/user.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRepository } from './event.repository';
import { Event } from './event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventRepository])],
  providers: [EventRepository],
  exports: [EventRepository],
})
export class EventModelModule {}
