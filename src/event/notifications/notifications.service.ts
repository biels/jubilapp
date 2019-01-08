import { Injectable } from '@nestjs/common';
import * as schedule from 'node-schedule';
import { EventService } from '../event.service';
import { EventRepository } from '../../model/event/event.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { UserRepository } from '../../model/user/user.repository';
import Expo from 'expo-server-sdk';
import { User } from '../../model/user/user.entity';
import { EventAttendee } from '../../model/event-attendee/event-attendee.entity';
import { Event } from '../../model/event/event.entity';
import { Repository } from 'typeorm';

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

    schedule.scheduleJob('*/1 * * * *', fireDate => {
      this.notifyNextEvents();
      this.notifyAllTokens();
    });
  }


  async addNotification(users: User[], body: string) {
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

  async notifyNextEvents() {
    let currentDate = new Date();

    let notificationDate = new Date(currentDate);

    let durationInMinutes = 1;

    notificationDate.setMinutes(currentDate.getMinutes() + durationInMinutes);

    let upcomingEvents: Event[] = await this.eventRepository.find({ relations: ['user'] });
    upcomingEvents = upcomingEvents.filter(event => event.startDate >= currentDate && event.startDate <= notificationDate);
    console.log(upcomingEvents);
    for (const upcomingEvent of upcomingEvents) {
      let eventAttendees = await this.eventAttendeeRepository.find({
        where: { event: upcomingEvent },
        relations: ['user'],
      });
      eventAttendees = eventAttendees.filter(eventAttendee => eventAttendee.attending == true);
      //Notifications
      let userToBeNotified: User[] = eventAttendees.map(ea => ea.user);
      let body: string = '¡La actividad  ' + upcomingEvent.name + ' empieza pronto!';
      console.log('TBN', userToBeNotified, body);
      await this.addNotification(userToBeNotified, body);
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
