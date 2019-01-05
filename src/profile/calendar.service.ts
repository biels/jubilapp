import { Injectable } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as ical from 'ical-generator';
import { User } from '../model/user/user.entity';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';
import { Repository } from 'typeorm';
import { Event } from '../model/event/event.entity';
import * as moment from 'moment';

@Injectable()
export class CalendarService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(EventAttendee)
    private readonly eventAttendeeRepository: Repository<EventAttendee>,
  ) {
  }

  async getUserAttendingList(user: User) {
    const eventAttendeList = await this.eventAttendeeRepository.find({
      where: { user: user },
      relations: ['event', 'event.user'],
    });
    return eventAttendeList.filter(ea => ea.attending);
  }

  async generateCalendarForUser(user: User): Promise<string> {
    const attendingList: EventAttendee[] = await this.getUserAttendingList(user);
    const mapEventToICalEvent = (e: Event): ical.EventData => {
      return {
        start: moment(e.startDate),
        end: moment(e.endDate || new Date()).add(1, 'hour'),
        summary: e.name,
        description: e.description,
        organizer: `${e.user.name} ${e.user.surname} <${e.user.email}>`,
        location: (e.latitude && e.longitude) ? `${e.latitude} ${e.longitude}` : null,
      };
    };
    // TODO Implement mapping
    const calendarEvents: ical.EventData[] = user.attendingEvents
      .filter(ea => ea.attending)
      .map(ea => ea.event)
      .map(mapEventToICalEvent);
    const iCalCalendar = ical({
      name: `${user.name}'s calendar`,
      events: calendarEvents,
    });
    return iCalCalendar.toString();
  }
}
