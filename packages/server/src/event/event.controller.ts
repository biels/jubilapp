import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { EventService } from './event.service';
import { AuthGuard } from '@nestjs/passport';
import { EventBody } from './interfaces/event-body.interface';
import { Request } from 'express';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventService: EventService,
  ) {
  }

  @Get()
  async get() {
    return { events: await this.eventService.allEvents() };
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
