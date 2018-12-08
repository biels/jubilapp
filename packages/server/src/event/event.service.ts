import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EventRepository } from '../model/event/event.repository';
import { User } from '../model/user/user.entity';
import { Repository } from 'typeorm';
import { Event } from '../model/event/event.entity';
import { EventBody } from './interfaces/event-body.interface';
import { EventCategory } from '../model/event/event-category.enum';

@Injectable()
export class EventService {

  constructor(
     @InjectRepository(EventRepository)
     private readonly eventRepository: EventRepository
  ) {
  }

  async allEvents(){
    return this.eventRepository.find()
  }
  async eventsForUser(user: User){
    return this.eventRepository.find({where: {user}})
  }
  async oneEvent(id){
    return this.eventRepository.findOne(id)
  }
  async createEvent(user: User, body: EventBody){
    return await this.eventRepository.save({...body, type: EventCategory[body.type], user})
  }
  async updateEvent(id, body: Partial<EventBody>){
    return await this.eventRepository.update({id}, {...body, type: (EventCategory[body.type])})
  }
  async deleteOwnEvent(user, id){
    return await this.eventRepository.delete({id})
  }
}
