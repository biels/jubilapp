import { Injectable } from '@nestjs/common';
import {EventRepository} from "../model/event/event.repository";
import {InjectRepository} from '@nestjs/typeorm';
import {Event} from "../model/event/event.entity";
import {EventCreationBody} from "./interfaces/event-creation-body.interface";
import {User} from "../model/user/user.entity";

@Injectable()
export class EventService {

    constructor(
        @InjectRepository(EventRepository)
        private readonly eventRepository: EventRepository
    ) {
    }

    async createEvent(body: EventCreationBody, user: User){
        let event = this.eventRepository.create(body);
        event.user = user
    }
}
