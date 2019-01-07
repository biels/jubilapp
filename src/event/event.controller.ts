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
import * as math from 'mathjs';
import { EventAttendee } from '../model/event-attendee/event-attendee.entity';

@Controller('event')
export class EventController {

  constructor(
    private readonly eventService: EventService,
  ) {
  }

  transformEventType = event => ({ ...event, type: EventCategory[event.type] });

  @Get('own')
  @UseGuards(AuthGuard())
  async myEvents(@Req() request) {
    if (request.user == null) throw new BadRequestException('You need to be logged in to view your events');
    return { events: await this.eventService.eventsForUser(request.user) };
  }

  @Get('stats')
  @UseGuards(AuthGuard())
  async getStats(@Req() request) {
    const allEvents: Event[] = await this.eventService.allEvents();
    const user: User = request.user;
    let filteredEvents: Event[] = allEvents;
    var arr = [];
    filteredEvents = filteredEvents.filter(event => event.user && event.user.id === user.id);
    filteredEvents = filteredEvents.filter(event => moment(event.endDate).isBefore(new Date()));
    for (let i = 0; i < 6; ++i) {
      let filteredEventsOneType = filteredEvents.filter(event => event.type == i);
      let ratings = filteredEventsOneType.filter(event => event.rating != null).map(event => event.rating);
      let rating = 0;
      if (ratings.length > 0) rating = math.mean(ratings);

      let attendances = filteredEventsOneType.filter(event => event.attendance != null).map(event => event.attendance);
      let attendance = 0;
      if (attendances.length > 0) attendance = math.mean(attendances);

      arr.push({
        type: EventCategory[i],
        quantity: filteredEventsOneType.length,
        MeanRating: rating,
        MeanAttendance: attendance,
      });
    }
    return arr;
  }


  @Get()
  @UseGuards(AuthGuard())
  async get(@Req() request, @Query('lat') lat, @Query('long') long, @Query('fromDate') fromDate, @Query('toDate') toDate, @Query('past') past, @Query('forMe') forMe, @Query('ownOnly') ownOnly, @Query('excludeOwn') excludeOwn, @Query('attendanceUnchecked') attendanceUnchecked, @Query('ratingPending') ratingPending, @Query('undecidedOnly') undecidedOnly, @Query('ratedOnly') ratedOnly) {
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
    let onlyUndecided;
    let onlyAttendanceUnchecked;
    let onlyRatingPending;
    let onlyRated;
    let excludingOwn;

    if (lat != null) lat = Number(lat);
    if (long != null) long = Number(long);
    past = (past === 'true');
    forMe = (forMe === 'true');
    ownOnly = (ownOnly === 'true');
    excludeOwn = (excludeOwn === 'true');
    attendanceUnchecked = (attendanceUnchecked === 'true');
    ratingPending = (ratingPending === 'true');
    if (attendanceUnchecked || ratingPending) past = true;
    if (ratingPending) {
      let EventAttendeeConfirmed: EventAttendee[] = await this.eventService.getEventAttendingListwithRatingPending(user);
      filteredEvents = EventAttendeeConfirmed.map(ea => ea.event);
      onlyRatingPending = true;
    }
    if (onlyRated) {
      filteredEvents = filteredEvents.filter(event => event.rating != null);
      ratedOnly = true;
    }
    if (ownOnly && excludeOwn) {
      warnings.push('You are using ownOnly and excludeOwn at the same time. This will never produce any results.');
    }
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
    if (undecidedOnly) {
      filteredEvents.filter(this.eventService.isUndecided);
      onlyUndecided = true;
    }
    if (attendanceUnchecked) {
      filteredEvents = filteredEvents.filter(event => event.attendance == null);
      filteredEvents = filteredEvents.filter(event => moment(event.endDate).isBefore(new Date()));
      filteredEvents = filteredEvents.filter(event => event.user && event.user.id === user.id);
      onlyAttendanceUnchecked = true;

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
      filteredEvents = filteredEvents.filter(event => event.user && event.user.id === user.id);
      onlyCreatedByMe = true;
    }
    if (excludeOwn) {
      filteredEvents = filteredEvents.filter(event => event.user && event.user.id !== user.id);
      excludingOwn = true;
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
    filteredEvents = _.sortBy(filteredEvents, e => e.startDate);
    const eventsPayload = filteredEvents.map(this.transformEventType);
    return {
      filter: {
        filteredByLocation,
        filteredByDate,
        showingPast,
        onlyInMyInterests,
        onlyAttendanceUnchecked,
        excludingOwn,
        onlyCreatedByMe,
        onlyRatingPending,
        onlyUndecided,
        onlyRated,
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

  @Post(':id/attendees')
  @UseGuards(AuthGuard())
  async setOneAttendees(@Req() request, @Param('id') id) {
    // TODO Needs testing
    if (request.user == null) throw new BadRequestException('You need to be logged to set the list of attendees of an event');
    const event = await this.eventService.oneEvent(id);
    if (event == null) throw new NotFoundException(`Event with id ${id} does not exist`);
    const oldAttendees = await this.eventService.getEventAttendingList(event);
    const newAttendees = request.body;
    if (!_.isArray(newAttendees)) throw new BadRequestException('Body must be an array of attendees');
    if (event.attendance != null) throw new BadRequestException('You have already check the attendance of this event');
    if (newAttendees == null) throw new BadRequestException('You need to provide an "attendees" array containing their ids');
    await this.eventService.setEventAttendanceList(event, newAttendees);
  }

  @Post(':id/rate')
  @UseGuards(AuthGuard())
  async rateEvent(@Req() request, @Param('id') id) {
    if (request.user == null) throw new BadRequestException('You need to be logged to rate an event');
    const event = await this.eventService.oneEvent(id);
    const rating = request.body.rating;
    if (rating == null) throw new BadRequestException('You must provide a rating');
    //if (event.attendance == null) throw new BadRequestException('The attendance of this event has not been checked by casal yet ' );
    await this.eventService.rateEvent(request.user, event, rating);
    return {};
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
