import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../event/event.entity';

@Entity()
export class EventAttendee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => Event, event => event.eventAttendees)
  event: Event;


}
