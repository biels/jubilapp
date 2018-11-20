import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Event } from '../event/event.entity';
import { EventAttendee } from '../event-attendee/event-attendee.entity';

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

  @OneToMany(type => Event, event => event.user)
  events: Event[];

  @OneToMany(type => EventAttendee, eventAttendee => eventAttendee.user)
  attendingEvents: EventAttendee[];

  @Column({nullable: true})
  searchDistance: number;


}
