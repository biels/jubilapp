import { Injectable } from '@nestjs/common';
import { UserRepository } from '../model/user/user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as ical from 'ical-generator'
import { User } from '../model/user/user.entity';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CalendarService {

  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    @InjectRepository(EventAttendee)
    private readonly eventAttendeeRepository: Repository<EventAttendee>
  ) {
  }
  async getUserAttendingList(user: User) {
    const eventAttendeList = await this.eventAttendeeRepository.find({ where: { user: user }, relations: ['event'] });
    return eventAttendeList.filter(ea => ea.attending)
  }
  async generateCalendarForUser(user: User){
    const attendingList = await this.getUserAttendingList(user);
    const mapEventToICalEvent = (event: EventAttendee) => {};
    // const events: ical.EventData[] = user.attendingEvents.map(mapEventToICalEvent)
    // const iCalCalendar = ical({
    //   name: 'Calendar for ' + user.name,
    //   events
    // });
    // return iCalCalendar.toString()
  }
}
