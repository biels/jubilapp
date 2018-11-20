import { Injectable } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as ical from 'ical-generator'
import { User } from '../model/user/user.entity';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';

@Injectable()
export class CalendarService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
  }

  async generateCalendarForUser(user: User){
    const getUserWithEvents = this.userRepository.findOneOrFail(user.id, {relations: ['attendingEvents', 'user.attendingEvents']});
    const mapEventToICalEvent = (event: EventAttendee) => {};
    const events: ical.EventData[] = user.attendingEvents.map(mapEventToICalEvent)
    const iCalCalendar = ical({
      name: 'Calendar for ' + user.name,
      events
    });
    return iCalCalendar.toString()
  }
}
