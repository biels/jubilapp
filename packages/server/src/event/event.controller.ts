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
import * as geolib from 'geolib';
import * as moment from 'moment';
import * as _ from 'lodash';
import { Event } from '../model/event/event.entity';
import { User } from 'model/user/user.entity';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventService: EventService,
  ) {
  }

  @Get()
  @UseGuards(AuthGuard())
  async get(@Req() request, @Query('lat') lat, @Query('long') long, @Query('fromDate') fromDate, @Query('toDate') toDate, @Query('past') past, @Query('forMe') forMe) {
    const allEvents: Event[] = await this.eventService.allEvents();
    const user: User = request.user;
    let filteredEvents: Event[] = allEvents;
    let filteredByLocation;
    let filteredByDate;
    let showingPast;
    let warnings = [];
    let radius;
    let onlyInMyInterests;
    lat = Number(lat)
    long = Number(long)
    if (lat != null && !_.isFinite(lat)) {
      warnings.push('Ignoring lat (latitude) as it is not valid');
      lat = null;
    }
    if (long != null && !_.isFinite(long)) {
      warnings.push('Ignoring long (longitude) as it is not valid');
      long = null;
    }
    if (fromDate != null && !moment(fromDate).isValid()) {
      warnings.push('Ignoring fromDate as is not a valid date. Using today instead.');
      fromDate = new Date();
    }
    if (toDate != null && !moment(toDate).isValid()) {
      warnings.push('Ignoring toDate as it is not a valid date');
      toDate = null;
    }
    if (!past) {
      filteredEvents = filteredEvents
        .filter(event => moment(event.startDate).isAfter(new Date()));
    } else {
      showingPast = true;
    }
    if (forMe) {
      warnings.push('Interest filtering is not yet implemented. Showing events for all interests.');
      onlyInMyInterests = false;
    }
    if (fromDate && toDate) {
      filteredEvents = filteredEvents
        .filter(event => moment(event.startDate).isBetween(fromDate, toDate));
      filteredByDate = true;
    }
    if (fromDate && !toDate) {
      filteredEvents = filteredEvents
        .filter(event => moment(event.startDate).isAfter(fromDate));
      filteredByDate = true;
    }
    if (!fromDate && toDate) {
      filteredEvents = filteredEvents
        .filter(event => moment(event.startDate).isBefore(toDate));
      filteredByDate = true;
    }
    if (lat && long && user) {
      const eventsWithLocation = filteredEvents
        .filter(event => event.latitude != null && event.longitude != null);
      if(eventsWithLocation.length === 0) {
        warnings.push('There are no events with a defined location in the selected range. Add some first.')
      }
      radius = user.searchDistance * 1000 || 5000;
      filteredEvents = eventsWithLocation
        .filter(event => geolib.isPointInCircle(
          { latitude: event.latitude, longitude: event.longitude },
          { latitude: lat, longitude: long },
          radius,
        ));
      filteredByLocation = true;
    }

    if ((lat || long) && !user) warnings.push('You need to be logged in to be able to filter by location');
    if ((lat && !long) || (long && !lat)) warnings.push('You need to provide both latitude and longitude (lat and long) when filtering by location');
    if (warnings.length === 0) warnings = undefined;
    radius = `${(radius/1000).toFixed(2)} km`
    return {

      filter: {
        filteredByLocation,
        filteredByDate,
        showingPast,
        latitude: lat,
        longitude: long,
        radius,
        fromDate,
        toDate,
      },
      warnings,
      events: filteredEvents,
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
