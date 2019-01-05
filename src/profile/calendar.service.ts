import { Injectable } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as ical from 'ical-generator';
import { User } from '../model/user/user.entity';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';
import { Repository } from 'typeorm';
import { Event } from '../model/event/event.entity';
import * as moment from 'moment';
import { attendeeStatus } from 'ical-generator';

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
      relations: ['event', 'event.user', 'event.eventAttendees', 'event.eventAttendees.user'],
    });
    return eventAttendeList.filter(ea => ea.attending);
  }

  async generateCalendarForUser(user: User): Promise<string> {
    const attendingList: EventAttendee[] = await this.getUserAttendingList(user);
    const mapEventToICalEvent = (e: Event): ical.EventData => {
      // console.log(`Event details: `, e);
      return {
        start: e.startDate,
        end: e.endDate || moment(e.startDate).add(3, 'hour'),
        summary: e.name || e.description,
        description: e.description,
        organizer: `${e.user.name || ''} ${e.user.surname || ''} <${e.user.email}>`,
        location: (e.latitude && e.longitude) ? `${e.latitude} ${e.longitude}` : null,
        attendees: e.eventAttendees
          .map(at => {
            let user = at.user
            const status: attendeeStatus = at.attending ? 'ACCEPTED' : 'DECLINED';
            return {
              name: `${user.name || ''} ${user.surname || ''}`,
              email: user.email,
              status: status
            }
          }),
      };
    };
    // TODO Implement mapping
    const calendarEvents: ical.EventData[] = attendingList
      .filter(ea => ea.attending)
      .map(ea => ea.event)
      .filter(e => e.startDate != null)
      .map(mapEventToICalEvent);
    const iCalCalendar = ical({
      name: `Jubilapp ${user.name}'s calendar`,
      domain: 'jubilapp.com',
      prodId: '//ironman-industries.com//ical-generator//EN',
      events: calendarEvents,
    });
    return iCalCalendar.toString();
  }
}
