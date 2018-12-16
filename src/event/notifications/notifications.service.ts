import { Injectable } from '@nestjs/common';
import schedule from 'node-schedule';
import { EventService } from '../event.service';
import { EventRepository } from '../../model/event/event.repository';
import { InjectRepository } from '@nestjs/typeorm';
import * as moment from 'moment';
import { UserRepository } from '../../model/user/user.repository';
import Expo from 'expo-server-sdk';

// Create a new Expo SDK client

@Injectable()
export class NotificationsService {

  constructor(
    private readonly eventService: EventService,
    @InjectRepository(EventRepository)
    private readonly eventRepository: EventRepository,
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository
  ) {
    this.expo = new Expo();
    this.scheduleNotifications();
    this.notifyAllTokens();
  }
  expo: Expo
  private scheduleNotifications(){

    schedule.scheduleJob('*/5 * * * *', fireDate => {
      this.notifyAllTokens();
    });
  }
  private async notifyAllTokens(){
    console.log(`Notifiying all tokens...`);
    const users = await this.userRepository.find();
    let messages = [];
    users.filter(user => user.pushToken != null)
      .forEach(user => {
      messages.push({
        to: user.pushToken,
        sound: 'default',
        body: 'AAThis is a test notification',
        data: {withSome: 'data'}
      });
    });
    let chunks = this.expo.chunkPushNotifications(messages);
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
  }
}
