import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from '../model/event/event.repository';
import { User } from '../model/user/user.entity';
import { DeepPartial, Repository } from 'typeorm';
import { Event } from '../model/event/event.entity';
import { EventBody } from './interfaces/event-body.interface';
import { EventCategory } from '../model/event/event-category.enum';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';

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
    return this.eventRepository.find();
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

  async setEventAttendingList(event: Event, attendees: User[], attending: boolean = true) {
    const eventAttendeList = await this.eventAttendeeRepository.find({ where: { event }, relations: ['user'] });
    await this.eventAttendeeRepository.update({event: event}, {attending: false});
    for (const attendee of attendees) {
      let eventAttendee: Partial<EventAttendee> = await this.eventAttendeeRepository.findOne({where: {user: attendee, event: event}});
      if(eventAttendee == null) eventAttendee = {user: attendee, event: event, attending}
      await this.eventAttendeeRepository.save(this.eventAttendeeRepository)
    }
    return eventAttendeList;
  }
}
