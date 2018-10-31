import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../user/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column()
  type: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(type => User, user => user.events)
  user: User;

  @Column()
  location: string;



}
