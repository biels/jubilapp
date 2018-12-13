import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../event/event.entity';
import { User } from '../user/user.entity';

@Entity()
export class EventAttendee {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(type => User, user => user.attendingEvents)
  user: User;

  @ManyToOne(type => Event, event => event.eventAttendees)
  event: Event;

  @Column()
  attending: boolean;
}
