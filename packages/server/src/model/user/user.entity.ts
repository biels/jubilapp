import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../event/event.entity';
import {EventCategory} from "../event/event-category.enum";
import {EventAttendee} from "../event-attendee/event-attendee.entity";

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

  @Column({ default: "000000" })
  interests: string;

  @OneToMany(type => Event, event => event.user)
  events: Event[];

  @OneToMany(type => EventAttendee, eventAttendee => eventAttendee.user)
  attendingEvents: EventAttendee[];

  @Column({nullable: true, default: 15})
  searchDistance: number;

  @Column({nullable: true})
  NIF: string;

  @Column({nullable: true})
  address: string;

  @Column({nullable: true})
  city: string;

  @Column({nullable: true})
  postcode: string;

  @Column({nullable: true})
  country: string;



}
