import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { EventService } from './event.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventService: EventService,
  ) {
  }

  @Get()
  async get(@Query('lat') lat, @Query('long') long, @Query('fromDate') fromDate, @Query('toDate') toDate) {
    if(lat && long){
      // TODO Filter based on location
    }
    return {
      events: await this.eventService.allEvents(),
      query: {
        latitude: lat,
        longitude: long,
        fromDate,
        toDate,
      },
    };
  }

  @Get('own')
  @UseGuards(AuthGuard())
  async myEvents(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to view your events');
    return { events: await this.eventService.eventsForUser(request.user) };
  }

  @Post()
  @UseGuards(AuthGuard())
  async createEvent(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to create an event');
    console.log(`eventBody`, request.body, 1);
    return { events: await this.eventService.createEvent(request.user, request.body) };
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to create an event');
    return { events: await this.eventService.updateEvent(id, request.body) };
  }

  @Get(':id')
  async getOne(@Param('id') id) {
    return { event: await this.eventService.oneEvent(id) };
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to delete your events');
    return { success: await this.eventService.deleteOwnEvent(request.user, id) };
  }

}
