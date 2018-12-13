import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { EventCategory } from './event-category.enum';
import { EventAttendee } from '../event-attendee/event-attendee.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({nullable: true})
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0})
  type: EventCategory;

  @Column({nullable: true})
  startDate: Date;

  @Column({nullable: true})
  endDate: Date;

  @ManyToOne(type => User, user => user.events)
  user: User;

  @Column({ nullable: true })
  longitude: number;

  @Column({ nullable: true })
  latitude: number;

  @Column({ nullable: true })
  capacity: string;

  @OneToMany(type => EventAttendee, eventAttendee => eventAttendee.event)
  eventAttendees: EventAttendee[];

}
