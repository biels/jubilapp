import { Injectable } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { EventService } from '../event.service';
import { EventRepository } from '../../model/event/event.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { UserRepository } from '../../model/user/user.repository';
import Expo from 'expo-server-sdk';
import {User} from "../../model/user/user.entity";
import {EventAttendee} from "../../model/event-attendee/event-attendee.entity";
import {Event} from "../../model/event/event.entity";
import {Repository} from "typeorm";

// Create a new Expo SDK client

@Injectable()
export class NotificationsService {

  constructor(
    @InjectRepository(EventRepository)
    private readonly eventRepository: EventRepository,
    @InjectRepository(EventAttendee)
    private readonly eventAttendeeRepository: Repository<EventAttendee>,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {
    this.expo = new Expo();
    this.scheduleNotifications();
    this.notifyAllTokens();
  }

  expo: Expo;
  private messages: any = [];

  private scheduleNotifications() {

    schedule.scheduleJob('*/5 * * * *', fireDate => {
      this.notifynextevents();
      this.notifyAllTokens();
    });
  }


  async addNotification (users: User[], body: string) {
    users.filter(user => user.pushToken != null)
        .forEach(user => {
          this.messages.push({
            to: user.pushToken,
            sound: 'default',
            body: body,
            data: { withSome: 'data' },
          });
        });
  }

  async notifynextevents() {
    let datenow = new Date();

    var datenotification = new Date(datenow);

    var durationInMinutes = 5;

    datenotification.setMinutes(datenow.getMinutes() + durationInMinutes);
    console.log(datenow);
    console.log(datenotification);

    let EventSoon = await this.eventRepository.find({relations: ['user']});
    EventSoon = EventSoon.filter(event => event.startDate >= datenow && event.startDate <= datenotification);
    console.log(EventSoon);
    for (const event of EventSoon) {
      let Attendees = await this.eventAttendeeRepository.find({ where: { event }, relations: ['user'] });
      Attendees = Attendees.filter(EventAttendee => EventAttendee.attending == true);
      //Notifications
      let UserToBeNotified: User [] = Attendees.map(ea => ea.user);
      console.log(UserToBeNotified);
      let body: string = '¡La actividad  ' + event.name + ' empieza pronto!';
      console.log(body);
      this.addNotification(UserToBeNotified, body);
    }
  }

  private async notifyAllTokens() {
    console.log(`Notifiying all tokens...`);
    let chunks = this.expo.chunkPushNotifications(this.messages);
    let tickets = [];
    (async () => {
      // Send the chunks to the Expo push notification service. There are
      // different strategies you could use. A simple one is to send one chunk at a
      // time, which nicely spreads the load out over time:
      for (let chunk of chunks) {
        try {
          let ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          console.log(ticketChunk);
          tickets.push(...ticketChunk);
          // NOTE: If a ticket contains an error code in ticket.details.error, you
          // must handle it appropriately. The error codes are listed in the Expo
          // documentation:
          // https://docs.expo.io/versions/latest/guides/push-notifications#response-format
        } catch (error) {
          console.error(error);
        }
      }
    })();
    console.log(`Tickets:`, tickets);
    this.messages = [];
  }
}
