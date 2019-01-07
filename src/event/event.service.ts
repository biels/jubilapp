import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from '../model/event/event.repository';
import { User } from '../model/user/user.entity';
import { DeepPartial, FindManyOptions, Repository } from 'typeorm';
import { Event } from '../model/event/event.entity';
import { EventBody } from './interfaces/event-body.interface';
import { EventCategory } from '../model/event/event-category.enum';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';
import * as moment from 'moment';
import * as _ from 'lodash';

@Injectable()
export class EventService {

  constructor(
      @InjectRepository(EventRepository)
      private readonly eventRepository: EventRepository,
      @InjectRepository(EventAttendee)
      private readonly eventAttendeeRepository: Repository<EventAttendee>,
  ) {
  }

  async allEvents() {
    return this.eventRepository.find({relations: ['user']});
  }

  async eventsForUser(user: User) {
    return this.eventRepository.find({ where: { user } });
  }

  async oneEvent(id) {
    return this.eventRepository.findOne(id);
  }

  async createEvent(user: User, body: EventBody) {
    return await this.eventRepository.save({ ...body, type: EventCategory[body.type], user });
  }

  async updateEvent(id, body: Partial<EventBody>) {
    const partialEntity = { ...body };
    if (body.type) partialEntity.type = EventCategory[body.type];
    return await this.eventRepository.update({ id }, partialEntity as any);
  }

  async deleteOwnEvent(user, id) {
    return await this.eventRepository.delete({ id });
  }

  async registerAttendee(user: User, event: Event, attending: boolean) {
    if (user == null || event == null) return null;
    let existing: DeepPartial<EventAttendee> = await this.eventAttendeeRepository.findOne({
      where: {
        event: { id: event.id },
        user: { id: user.id },
      },
    });
    if (existing == null) {
      existing = { user: { id: user.id }, event: { id: event.id }, attending: attending };
    }
    existing.attending = attending;
    console.log(`Saving attendee: `, existing);
    await this.eventAttendeeRepository.save(existing);
  }

  async isUserAttendingEvent(user: User, event: Event) {
    const eventAttendee = await this.eventAttendeeRepository.findOne({ where: { event, user } });
    if (eventAttendee == null) return null;
    return eventAttendee.attending;
  }

  async getUserAttendingList(user: User) {
    const eventAttendeList = await this.eventAttendeeRepository.find({ where: { user: user }, relations: ['event'] });
    return eventAttendeList;
  }

  async getEventAttendingList(event: Event) {
    const eventAttendeList = await this.eventAttendeeRepository.find({ where: { event }, relations: ['user'] });
    return eventAttendeList;
  }
  async getEventAttendingListwithRatingPending(user: User) {
    let eventAttendeeList = await this.eventAttendeeRepository.find({ where: { user: user }, relations: ['event'] });
    eventAttendeeList = eventAttendeeList.filter(EventAttendee => EventAttendee.attendanceConfirmed == true);
    eventAttendeeList = eventAttendeeList.filter(EventAttendee => EventAttendee.rating == null);
    return eventAttendeeList;
  }

  async setEventAttendanceList(event: Event, attendees: EventAttendee[]) {
    if(event == null) throw new BadRequestException("Event not found");
    if(attendees == null) throw new BadRequestException("Attendee list not found");
    let oldAttendees = await this.getEventAttendingList(event);
    oldAttendees = oldAttendees.filter(EventAttendee => EventAttendee.attending == true);
    const newAttendees = attendees.filter(EventAttendee => EventAttendee.attendanceConfirmed == true);
    if (oldAttendees.length > 0) event.attendance = (newAttendees.length/oldAttendees.length)
    else event.attendance = 0;
    await this.eventRepository.save(event);

    if (newAttendees.length != 0){
      for (const attendee of attendees) {
        let eventAttendee: Partial<EventAttendee> = await this.eventAttendeeRepository.findOne({where: {user: attendee.user, event: event}});
        eventAttendee.attendanceConfirmed = attendee.attendanceConfirmed;
        await this.eventAttendeeRepository.save(eventAttendee);
      }
    }

  }
  async rateEvent(user: User, event: Event, rating: number){
    let eventAttende: EventAttendee = await this.eventAttendeeRepository.findOne({ where: { event, user }, relations: ['user'] });
    if(eventAttende == null || (eventAttende && !eventAttende.attending))
      throw new BadRequestException('You have to have assisted to the event to be able to rate it');
    if (eventAttende.rating != null)
      throw new BadRequestException('You have already rated it');
    if(moment(event.startDate).isAfter(new Date()))
      throw new BadRequestException('The activity has not started yet. You cannot rate it yet.');
    if(eventAttende && !eventAttende.attendanceConfirmed)
      throw new BadRequestException('You have to have not assisted to the event or your assistance has not been confirmed yet');
    // User has attended the event
    eventAttende.rating = rating;
    await this.eventAttendeeRepository.save(eventAttende);
    await this.updateEventRating(event);
  }
  async updateEventRating(event: Event){
    const eventAttendees = await this.eventAttendeeRepository.find({where: {event}});
    let ratings = eventAttendees.filter(ea => ea.rating != null).map(ea => ea.rating);
    event.rating = _.mean(ratings);
    await this.eventRepository.save(event);
  }
}
