import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { EventCategory } from '../model/event/event-category.enum';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventService: EventService,
  ) {
  }

  transformEventType = event => ({ ...event, type: EventCategory[event.type] });

  @Get()
  @UseGuards(AuthGuard())
  async get(@Req() request, @Query('lat') lat, @Query('long') long, @Query('fromDate') fromDate, @Query('toDate') toDate, @Query('past') past, @Query('forMe') forMe, @Query('ownOnly') ownOnly) {
    const allEvents: Event[] = await this.eventService.allEvents();
    const user: User = request.user;
    let showing, total, totalAfterPast;
    let filteredEvents: Event[] = allEvents;
    let filteredByLocation;
    let filteredByDate;
    let showingPast;
    let warnings = [];
    let radius;
    let onlyInMyInterests;
    let onlyCreatedByMe;
    if (lat != null) lat = Number(lat);
    if (long != null) long = Number(long);
    past = Boolean(past);
    forMe = Boolean(forMe);
    ownOnly = Boolean(ownOnly);
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
      totalAfterPast = filteredEvents.length;
    } else {
      showingPast = true;
    }
    if (forMe) {
      if (user.interests == null) warnings.push('The user does not have interests in the profile');
      else {
        for (let i = 0; i < 6; ++i) {
          if (user.interests[i] === '0') {
            filteredEvents = filteredEvents
              .filter(event => event.type !== i);
          }
        }
        onlyInMyInterests = true;
      }
    }
    if (ownOnly) {
      filteredEvents = filteredEvents.filter(event => event.user.id === user.id);
      onlyCreatedByMe = true;
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
      if (eventsWithLocation.length === 0) {
        warnings.push('There are no events with a defined location in the selected range. Add some first.');
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
    if ((forMe) && !user) warnings.push('You need to be logged in to be able to filter by interests');
    if ((lat || long) && !user) warnings.push('You need to be logged in to be able to filter by location');
    if ((lat && !long) || (long && !lat)) warnings.push('You need to provide both latitude and longitude (lat and long) when filtering by location');
    if (warnings.length === 0) warnings = undefined;
    if (filteredByLocation) radius = `${(radius / 1000).toFixed(2)} km`;
    if (!showingPast && (filteredEvents.length !== totalAfterPast)) {
      showing = filteredEvents.length;
      total = totalAfterPast;
    }
    if (showingPast && (filteredEvents.length !== allEvents.length)) {
      showing = filteredEvents.length;
      total = allEvents.length;
    }
    const eventsPayload = filteredEvents.map(this.transformEventType);
    return {
      filter: {
        filteredByLocation,
        filteredByDate,
        showingPast,
        onlyInMyInterests,
        latitude: lat,
        longitude: long,
        radius,
        fromDate,
        toDate,
        showing,
        total,
      },
      warnings,
      events: eventsPayload,
    };
  }

  @Get('own')
  @UseGuards(AuthGuard())
  async myEvents(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to view your events');
    return { events: await this.eventService.eventsForUser(request.user) };
  }

  @Get('attending')
  @UseGuards(AuthGuard())
  async eventsIAttend(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to view your events');
    const attendees = await this.eventService.getUserAttendingList(request.user);
    const attendeeToEvent = a => this.transformEventType(a.event);
    return {
      events: {
        yes: attendees.filter(a => a.attending).map(attendeeToEvent),
        no: attendees.filter(a => !a.attending).map(attendeeToEvent),
      },
    };
  }

  @Post()
  @UseGuards(AuthGuard())
  async createEvent(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to create an event');
    console.log(`eventBody`, request.body, 1);
    return { events: this.transformEventType(await this.eventService.createEvent(request.user, request.body)) };
  }

  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to create an event');
    const event = await this.eventService.oneEvent(id);
    if (event == null) throw new NotFoundException(`Event with id ${id} does not exist`);
    return { events: this.transformEventType(await this.eventService.updateEvent(id, request.body)) };
  }


  @Get(':id')
  async getOne(@Param('id') id) {
    const event = await this.eventService.oneEvent(id);
    if (event == null) throw new NotFoundException(`Event with id ${id} does not exist`);
    return { event: this.transformEventType(event) };
  }

  @Get(':id/attendees')
  async getOneAttendees(@Param('id') id) {
    const event = await this.eventService.oneEvent(id);
    if (event == null) throw new NotFoundException(`Event with id ${id} does not exist`);
    const attendees = await this.eventService.getEventAttendingList(event);
    const attendeeToUser = a => _.pick(a.user, ['id', 'name', 'surname', 'email']);
    return {
      attendees: {
        yes: attendees.filter(a => a.attending).map(attendeeToUser),
        no: attendees.filter(a => !a.attending).map(attendeeToUser),
      },
    };
  }

  @Post(':id/attend')
  @UseGuards(AuthGuard())
  async attendToEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to attend to an event');
    const event = await this.eventService.oneEvent(id);
    await this.eventService.registerAttendee(request.user, event, true);
    return { attending: true };
  }

  @Delete(':id/attend')
  @UseGuards(AuthGuard())
  async dontAttendToEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to mark you are not going to an event');
    const event = await this.eventService.oneEvent(id);
    await this.eventService.registerAttendee(request.user, event, false);
    return { attending: false };
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to delete your events');
    return { success: await this.eventService.deleteOwnEvent(request.user, id) };
  }

}
