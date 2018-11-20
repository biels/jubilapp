import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../event/event.entity';
import { EventAttendee } from '../event-attendee/event-attendee.entity';
import {EventCategory} from "../event/event-category.enum";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  surname: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phone: string;

  @Column({default: 15})
  km: number;

  @Column({ nullable: true })
  interests: number;

  @OneToMany(type => Event, event => event.user)
  events: Event[];

  @OneToMany(type => EventAttendee, eventAttendee => eventAttendee.user)
  attendingEvents: EventAttendee[];

  @Column({nullable: true})
  searchDistance: number;


}
