import {BadRequestException, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {User} from '../model/user/user.entity';
import {AuthGuard} from '@nestjs/passport';
import {EventService} from "./event.service";

@Controller('event')
export class EventController {

    constructor(
        private readonly eventService: EventService,
    ) {
    }

    @Post()
    //@UseGuards(AuthGuard())
    async create(@Req() request) {
        console.log("ENTRA")
        if (request.user == null) throw new BadRequestException('You need to be logged in to create an event');
        return await this.eventService.createEvent(request.body, request.user);
    }
}
